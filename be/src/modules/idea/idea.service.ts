import { CategoryIdea } from '@core/database/mysql/entity/categoryIdea.entity';
import { IdeaFile } from '@core/database/mysql/entity/file.entity';
import { IUserData } from '@core/interface/default.interface';
import sendMailNodemailer from '@helper/nodemailer';
import { CategoryIdeaService } from '@modules/category-idea/category-idea.service';
import { IdeaFileService } from '@modules/idea-file/idea-file.service';
import { ReactionService } from '@modules/reaction/reaction.service';
import { SemesterService } from '@modules/semester/semester.service';
import { UserService } from '@modules/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { EIdeaFilter } from 'enum/idea.enum';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { VUpdateIdeaDto } from 'global/dto/update-idea.dto';
import * as moment from 'moment';
import { Idea } from 'src/core/database/mysql/entity/idea.entity';
import {
  Repository,
  EntityManager,
  DeepPartial,
  Connection,
  getManager,
  SelectQueryBuilder,
} from 'typeorm';
import { utc } from 'moment';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(Idea)
    private readonly ideaRepository: Repository<Idea>,
    private readonly semesterService: SemesterService,
    private readonly categoryIdeaService: CategoryIdeaService,
    private readonly ideaFileService: IdeaFileService,
    private readonly reactionService: ReactionService,
    private readonly userService: UserService,
    private readonly connection: Connection,
  ) {}

  async getIdeaDetail(
    idea_id: number,
    user_id?: string,
    entityManager?: EntityManager,
  ) {
    let data = [];

    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;
    const idea = await this.ideaRepository.findOne({
      where: { idea_id: idea_id },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryBuilder = ideaRepository
      .createQueryBuilder('idea')
      .leftJoinAndSelect('idea.files', 'files');

    const [listFiles] = await queryBuilder.getMany();
    data = listFiles.files.map((file) => file.file);

    return {
      user_id: user_id,
      title: idea.title,
      content: idea.content,
      date: idea.created_at,
      file: data,
    };
  }

  async getAllIdeas(
    semester_id?: number,
    department_id?: number,
    category_id?: number,
    sorting_setting?: EIdeaFilter,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    if (semester_id == null) {
      const currentSemester = await this.semesterService.getCurrentSemester();
      semester_id = currentSemester.semester_id;
    }

    let ideaQueryBuilder: SelectQueryBuilder<any>;

    if (sorting_setting == EIdeaFilter.MOST_POPULAR_IDEAS) {
      const subQuery = ideaRepository
        .createQueryBuilder('idea')
        .addSelect('IFNULL(SUM(reaction.type), 0)', 'total')
        .innerJoin('idea.user', 'user')
        .innerJoinAndSelect('user.userDetail', 'user_detail')
        .innerJoinAndSelect('user.department', 'department')
        .leftJoin('idea.reactions', 'reaction')
        .where('idea.semester_id = :semester_id', { semester_id })
        .groupBy('idea.idea_id')
        .orderBy('total', 'DESC');

      ideaQueryBuilder = getManager()
        .createQueryBuilder()
        .select('popular_idea.*')
        .addSelect('COUNT(comment.idea_id)', 'comments')
        .from('(' + subQuery.getQuery() + ')', 'popular_idea')
        .leftJoin(
          'comment',
          'comment',
          'comment.idea_id = popular_idea.idea_idea_id',
        )
        .groupBy('popular_idea.idea_idea_id')
        .setParameters(subQuery.getParameters());
    } else {
      ideaQueryBuilder = ideaRepository
        .createQueryBuilder('idea')
        .addSelect('COUNT(comment.idea_id)', 'comments')
        .innerJoin('idea.user', 'user')
        .innerJoinAndSelect('user.userDetail', 'user_detail')
        .innerJoinAndSelect('user.department', 'department')
        .leftJoin('idea.comments', 'comment')
        .where('idea.semester_id = :semester_id', { semester_id })
        .groupBy('idea.idea_id');

      if (sorting_setting == EIdeaFilter.MOST_VIEWED_IDEAS) {
        ideaQueryBuilder.orderBy('idea.views', 'DESC');
      } else if (sorting_setting == EIdeaFilter.RECENT_IDEAS) {
        ideaQueryBuilder.orderBy('idea.created_at', 'DESC');
      }
    }

    if (department_id != null) {
      ideaQueryBuilder.andWhere('user.department_id = :department_id', {
        department_id,
      });
    }

    if (category_id != null) {
      const txtIdeaId =
        sorting_setting == EIdeaFilter.MOST_POPULAR_IDEAS
          ? 'popular_idea.idea_idea_id'
          : 'idea.idea_id';
      const subQuery = getManager()
        .createQueryBuilder()
        .select('category_idea.idea_id')
        .from('category_idea', 'category_idea')
        .where('category_idea.category_id = :category_id', { category_id });

      ideaQueryBuilder
        .andWhere(txtIdeaId + ' IN (' + subQuery.getQuery() + ')')
        .setParameters(subQuery.getParameters());
    }

    const rows = await ideaQueryBuilder.getRawMany();
    const data = [];

    for (const cursor of rows) {
      const idea_id = cursor.idea_idea_id;
      const categoryIdeas = await this.categoryIdeaService.getCategoriesByIdea(
        idea_id,
      );
      const categories = categoryIdeas.map(
        (categoryIdea) => categoryIdea.category,
      );

      data.push({
        idea_id: idea_id,
        title: cursor.idea_title,
        content: cursor.idea_content,
        views: cursor.idea_views,
        comments: cursor.comments,
        is_anonymous: cursor.idea_is_anonymous,
        created_at: cursor.idea_created_at,
        categories,
        user: {
          user_id: cursor.idea_user_id,
          full_name: cursor.user_detail_full_name,
          nick_name: cursor.user_detail_nick_name,
          gender: cursor.user_detail_gender,
          birthday: cursor.user_detail_birthday,
          avatar_url: cursor.user_detail_avatar_url,
          department: {
            department_id: cursor.department_department_id,
            department_name: cursor.department_name,
            manager_id: cursor.department_manager_id,
          },
        },
      });
    }

    return data;
  }

  async createIdea(userData: IUserData, body: VCreateIdeaDto) {
    let data: DeepPartial<Idea>;

    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_POST_IDEA,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      data = await this.connection.transaction(async (manager) => {
        const currentSemester = await this.semesterService.getCurrentSemester();
        const ideaParams = new Idea();
        ideaParams.user_id = userData.user_id;
        ideaParams.title = body.title;
        ideaParams.content = body.content;
        ideaParams.is_anonymous = body.is_anonymous;
        ideaParams.semester_id = currentSemester.semester_id;

        const idea = await this.saveIdea(ideaParams, manager);

        console.log(idea);

        const postFileParams = [];
        if (body?.files && body?.files.length) {
          body.files.forEach((files) => {
            const ideaFileParam = new IdeaFile();
            ideaFileParam.idea_id = idea.idea_id;
            ideaFileParam.file = files.file;
            ideaFileParam.size = files.size;

            postFileParams.push(ideaFileParam);
          });
        }
        const categoryIdeaParams = [];

        if (body?.category_ids && body?.category_ids?.length) {
          body.category_ids.forEach((category_id) => {
            const categoryIdeaParam = new CategoryIdea();
            categoryIdeaParam.idea_id = idea.idea_id;
            categoryIdeaParam.category_id = category_id;

            console.log('categoryIdeaParam: ', categoryIdeaParam);

            categoryIdeaParams.push(categoryIdeaParam);
          });
        }
        const result = await Promise.allSettled([
          this.ideaFileService.createIdeaFile(postFileParams, manager),
          this.categoryIdeaService.createIdeaCategory(
            categoryIdeaParams,
            manager,
          ),
        ]);

        if (result.some((r) => r.status === 'rejected'))
          throw new HttpException(
            'ErrorMessage.POSTING_IDEA_FAILED',
            HttpStatus.BAD_REQUEST,
          );

        return idea;
      });

      const result = await this.ideaRepository
        .createQueryBuilder('idea')
        .select('staff_detail.nick_name as staff_nick_name, manager_detail.nick_name as manager_nick_name, manager.email as manager_email, department.name as department, idea.created_at')
        .innerJoin('idea.user', 'staff')
        .innerJoin('staff.userDetail', 'staff_detail')
        .innerJoin('staff.department', 'department')
        .innerJoin('department.manager', 'manager')
        .innerJoin('manager.userDetail', 'manager_detail')
        .where('idea.idea_id = :idea_id', { idea_id: data.idea_id! })
        .getRawOne();

      const ideaCategories = await this.categoryIdeaService.getCategoriesByIdea(data.idea_id!);
      const categories = ideaCategories.map(c => {
        return c.category.name;
      });

      const email = result["manager_email"];
      const receiverUsername = result["manager_nick_name"];
      const staffUsername = result["staff_nick_name"];
      const department = result["department"];
      const ideaTitle = data.title!;
      const ideaContent = data.content!;
      const date = new Date(result["created_at"]);
      const createdTime = date.toLocaleTimeString();
      let month = date.getMonth() + "";
      if(month.length == 1) {
        month = 0 + month;
      }
      const txtDate = date.getFullYear() + "-" + month + "-" + date.getDate();
      const createdDate = moment(txtDate, "YYYY-MM-DD").format("MMM DD, YYYY");
      sendMailNodemailer(
        email,
        'GIC - Idea Submission',
        'idea_submission.hbs',
        { receiverUsername, staffUsername, createdDate,
          createdTime, department, ideaTitle, ideaContent, categories},
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      idea_id: data.idea_id,
      files: body.files || [],
    };
  }

  async saveIdea(value: DeepPartial<Idea>, entityManager?: EntityManager) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    console.log(value);

    return await ideaRepository.save(value);
  }

  async createIdeaReaction(
    userData: IUserData,
    idea_id: number,
    body: VCreateReactionDto,
  ) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.IDEA_REACTION_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.ideaRepository.findOne({
      where: { idea_id },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.reactionService.createReaction(userData.user_id, idea_id, body);
  }

  async deleteIdeaReaction(userData: IUserData, idea_id: number) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.IDEA_REACTION_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.ideaRepository.findOne({
      where: { idea_id },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.reactionService.deleteReaction(userData.user_id, idea_id);
  }

  async checkIdea(idea_id: number, user_id: string) {
    return await this.ideaRepository.findOne({
      where: { idea_id: idea_id, user_id: user_id },
    });
  }

  async updateIdea(userData: IUserData, idea_id: number, body: VUpdateIdeaDto) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_IDEA,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAccess = await this.checkIdea(idea_id, userData.user_id);

    if (!isAccess) {
      throw new HttpException(
        ErrorMessage.UPDATE_POST_PERMISSION_DENIED,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.connection.transaction(async (manager) => {
        const currentSemester = await this.semesterService.getCurrentSemester();
        const ideaParams = new Idea();
        ideaParams.user_id = userData.user_id;
        ideaParams.title = body.title;
        ideaParams.content = body.content;
        ideaParams.is_anonymous = body.is_anonymous;
        ideaParams.semester_id = currentSemester.semester_id;

        const idea = await this.updateIdeaCurrent(
          {
            idea_id: idea_id,
          },
          ideaParams,
          manager,
        );

        const postFileParams = [];
        if (body?.files && body?.files.length) {
          body.files.forEach((files) => {
            const ideaFileParam = new IdeaFile();
            ideaFileParam.idea_id = idea_id;
            ideaFileParam.file = files.file;
            ideaFileParam.size = files.size;
            postFileParams.push(ideaFileParam);
          });
        }
        const categoryIdeaParams = [];

        await this.ideaFileService.deleteIdeaFile(idea_id);

        if (body?.category_ids && body?.category_ids?.length) {
          body.category_ids.forEach((category_id) => {
            const categoryIdeaParam = new CategoryIdea();
            categoryIdeaParam.idea_id = idea_id;
            categoryIdeaParam.category_id = category_id;

            categoryIdeaParams.push(categoryIdeaParam);
          });
        }

        await this.categoryIdeaService.deleteIdeaCategory(idea_id);

        const result = await Promise.allSettled([
          this.ideaFileService.createIdeaFile(postFileParams, manager),
          this.categoryIdeaService.createIdeaCategory(
            categoryIdeaParams,
            manager,
          ),
        ]);

        if (result.some((r) => r.status === 'rejected'))
          throw new HttpException(
            'ErrorMessage.UPDATING_IDEA_FAILED',
            HttpStatus.BAD_REQUEST,
          );

        return idea;
      });
    } catch (error) {
      console.log(error, 1111111);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      idea_id: idea_id,
      files: body.files || [],
    };
  }

  async updateIdeaCurrent(
    conditions: DeepPartial<Idea>,
    value: DeepPartial<Idea>,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    await ideaRepository.update(conditions, value);
  }
}
