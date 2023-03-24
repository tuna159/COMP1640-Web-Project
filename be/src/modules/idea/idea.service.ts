import { CategoryIdea } from '@core/database/mysql/entity/categoryIdea.entity';
import { Comment } from '@core/database/mysql/entity/comment.entity';
import { IdeaFile } from '@core/database/mysql/entity/file.entity';
import { IUserData } from '@core/interface/default.interface';
import sendMailNodemailer from '@helper/nodemailer';
import { CategoryIdeaService } from '@modules/category-idea/category-idea.service';
import { CommentService } from '@modules/comment/comment.service';
import { IdeaFileService } from '@modules/idea-file/idea-file.service';
import { ReactionService } from '@modules/reaction/reaction.service';
import { EventService } from '@modules/event/event.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Response, Request } from 'express';
import * as send from 'send';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { EIdeaFilter } from 'enum/idea.enum';
import { VAddComment } from 'global/dto/addComment.dto';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { VUpdateIdeaDto } from 'global/dto/update-idea.dto';
import { join } from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import { stringify } from 'csv-stringify';
import { Idea } from 'src/core/database/mysql/entity/idea.entity';
import {
  Repository,
  EntityManager,
  DeepPartial,
  Connection,
  getManager,
  SelectQueryBuilder,
} from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { VUpdateCommentDto } from 'global/dto/comment.dto';
import { TagService } from '@modules/tag/tag.service';
import { IdeaTagService } from '@modules/idea-tag/idea-tag.service';
import { IdeaTag } from '@core/database/mysql/entity/ideaTag.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(Idea)
    private readonly ideaRepository: Repository<Idea>,
    private readonly eventService: EventService,
    private readonly categoryIdeaService: CategoryIdeaService,
    private readonly ideaFileService: IdeaFileService,
    private readonly reactionService: ReactionService,
    private readonly connection: Connection,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly tagService: TagService,
    private readonly ideaTagService: IdeaTagService,
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
      where: {
        idea_id: idea_id,
        is_deleted: EIsDelete.NOT_DELETE,
      },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryBuilder = ideaRepository
      .createQueryBuilder('idea')
      .leftJoinAndSelect('idea.files', 'files')
      .innerJoinAndSelect('idea.event', 'event')
      .innerJoinAndSelect('idea.user', 'user')
      .where('idea.idea_id = :idea_id', { idea_id });

    const result = await queryBuilder.getMany();
    const [listFiles] = result;
    data = listFiles.files.map((file) => file.file);

    return {
      user_id: user_id,
      title: idea.title,
      content: idea.content,
      date: idea.created_at,
      file: data,
      event: result[0].event,
      user: {
        email: result[0].user.email,
      },
    };
  }

  async getAllIdeas(
    event_id?: number,
    department_id?: number,
    category_id?: number,
    sorting_setting?: EIdeaFilter,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    let ideaQueryBuilder: SelectQueryBuilder<any>;

    if (sorting_setting == EIdeaFilter.MOST_POPULAR_IDEAS) {
      const subQuery = ideaRepository
        .createQueryBuilder('idea')
        .addSelect('IFNULL(SUM(reaction.type), 0)', 'total')
        .innerJoin('idea.user', 'user')
        .innerJoinAndSelect('user.userDetail', 'user_detail')
        .innerJoinAndSelect('user.department', 'department')
        .leftJoin('idea.reactions', 'reaction')
        .where('idea.event_id = :event_id', { event_id })
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
        .where('idea.event_id = :event_id', { event_id })
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

  async createIdea(
    userData: IUserData,
    body: VCreateIdeaDto,
    event_id: number,
  ) {
    let data: DeepPartial<Idea>;
    try {
      data = await this.connection.transaction(async (manager) => {
        let event = await this.eventService.getEventById(event_id);
        if (!event) {
          throw new HttpException(
            ErrorMessage.EVENT_NOT_EXIST,
            HttpStatus.BAD_REQUEST,
          );
        }

        event = await this.eventService.checkEventToCreateIdea(event_id);
        if (!event) {
          throw new HttpException(
            ErrorMessage.FIRST_CLOSURE_DATE_UNAVAILABLE,
            HttpStatus.BAD_REQUEST,
          );
        }

        const ideaParams = new Idea();
        ideaParams.user_id = userData.user_id;
        ideaParams.title = body.title;
        ideaParams.content = body.content;
        ideaParams.is_anonymous = body.is_anonymous;
        ideaParams.event_id = event.event_id;

        const idea = await this.saveIdea(ideaParams, manager);

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
        const categoryIdeaParam = new CategoryIdea();
        categoryIdeaParam.idea_id = idea.idea_id;
        categoryIdeaParam.category_id = body.category_id;
        categoryIdeaParams.push(categoryIdeaParam);

        const ideaTags = [];
        const tagDto = body.tag_names;

        tagDto.forEach(async (dto) => {
          const tag = await this.tagService.getTagByName(dto.name);
          const ideaTag = new IdeaTag();
          if (tag) {
            ideaTag.idea_id = idea.idea_id;
            ideaTag.tag_id = tag.tag_id;
          } else {
            const newTag = await this.tagService.createTag(dto.name);
            ideaTag.idea_id = idea.idea_id;
            ideaTag.tag_id = newTag.tag_id;
          }
          ideaTags.push(ideaTag);
        });

        const result = await Promise.allSettled([
          this.ideaFileService.createIdeaFile(postFileParams, manager),
          this.categoryIdeaService.createIdeaCategory(
            categoryIdeaParams,
            manager,
          ),
          this.ideaTagService.createIdeaTag(ideaTags, manager),
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
        .select(
          'staff_detail.nick_name as staff_nick_name, manager_detail.nick_name as manager_nick_name, manager.email as manager_email, department.name as department, idea.created_at',
        )
        .innerJoin('idea.user', 'staff')
        .innerJoin('staff.userDetail', 'staff_detail')
        .innerJoin('staff.department', 'department')
        .innerJoin('department.manager', 'manager')
        .innerJoin('manager.userDetail', 'manager_detail')
        .where('idea.idea_id = :idea_id', { idea_id: data.idea_id! })
        .getRawOne();

      const ideaCategories = await this.categoryIdeaService.getCategoriesByIdea(
        data.idea_id!,
      );
      const categories = ideaCategories.map((c) => {
        return c.category.name;
      });

      const email = result['manager_email'];
      const receiverUsername = result['manager_nick_name'];
      const staffUsername = result['staff_nick_name'];
      const department = result['department'];
      const ideaTitle = data.title!;
      const ideaContent = data.content!;
      const date = new Date(result['created_at']);
      const createdTime = date.toLocaleTimeString();
      let month = date.getMonth() + '';
      if (month.length == 1) {
        month = 0 + month;
      }
      const txtDate = date.getFullYear() + '-' + month + '-' + date.getDate();
      const createdDate = moment(txtDate, 'YYYY-MM-DD').format('MMM DD, YYYY');
      sendMailNodemailer(
        email,
        'GIC - Idea Submission',
        'idea_submission.hbs',
        {
          receiverUsername,
          staffUsername,
          createdDate,
          createdTime,
          department,
          ideaTitle,
          ideaContent,
          categories,
        },
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
        const ideaParams = new Idea();
        ideaParams.user_id = userData.user_id;
        ideaParams.title = body.title;
        ideaParams.content = body.content;
        ideaParams.is_anonymous = body.is_anonymous;

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

  async getIdeaCommentsByParent(
    idea_id: number,
    parent_id: number,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    const idea = await ideaRepository.findOne({
      where: { idea_id: idea_id },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commentService.getIdeaCommentsByParent(idea_id, parent_id);
  }

  downloadIdeasByEvent(
    userData: IUserData,
    event_id: number,
    res: Response,
    req: Request,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    if (userData.role_id != EUserRole.QA_MANAGER) {
      throw new HttpException(
        ErrorMessage.DATA_DOWNLOAD_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const temp = join(process.cwd(), 'package.json');
    send(req, temp).pipe(res);
    return;
    // const temp = fs.createReadStream(join(process.cwd(), 'package.json'));
    // return new StreamableFile(temp);

    // const event = await this.eventService.getEventById(event_id);

    // if(!event) {
    //   throw new HttpException(
    //     ErrorMessage.event_NOT_EXIST,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // if(event.final_closure_date) {
    //   throw new HttpException(
    //     ErrorMessage.DATA_DOWNLOAD_DATE_TIME,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const data = [
      ['John Doe', 30, 'New York'],
      ['Jane Smith', 25, 'San Francisco'],
      ['Bob Johnson', 40, 'Los Angeles'],
    ];

    const fileName = 'data.csv';
    const path = join(process.cwd(), 'src', fileName);

    const writableStream = fs.createWriteStream(path);
    const columns = ['name', 'age', 'city'];

    // try {
    const stringifier = stringify({ header: true, columns: columns });
    data.forEach((d) => {
      stringifier.write(d);
    });

    // stringifier.pipe(res);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="data.csv"',
    });
    // res.sendFile(path);
    const file = fs.createReadStream(path);
    // file.pipe(res);
    res.send(file.pipe(res));
    // return new StreamableFile(file);
    // } catch (error) {
    //   throw new HttpException(
    //     ErrorMessage.DATA_DOWNLOAD_FAILED,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
  }

  async createComment(userData: IUserData, idea_id: number, body: VAddComment) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.CREATE_COMMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.getIdeaDetail(idea_id);

    if (!body.content) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.content === '' || body.content === null) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.parent_id == null && body.level != 1) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }

    const current = new Date();
    if (idea.event.final_closure_date < current) {
      throw new HttpException(
        ErrorMessage.FINAL_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const comment = new Comment();
      comment.idea_id = idea_id;
      comment.author_id = userData.user_id;
      comment.parent_id = body.parent_id;
      comment.level = body.level;
      comment.content = body.content;
      const newComment = await this.commentService.addIdeaComment(comment);

      if (userData.user_id !== idea.user_id) {
        return newComment;
      }

      const email = idea.user['email'];
      // temporary solution
      const result = await this.ideaRepository
        .createQueryBuilder('idea')
        .select(
          'staff_detail.nick_name as staff_nick_name, department.name as department, idea.created_at',
        )
        .innerJoin('idea.user', 'staff')
        .innerJoin('staff.userDetail', 'staff_detail')
        .innerJoin('staff.department', 'department')
        .where('idea.idea_id = :idea_id', { idea_id })
        .getRawOne();

      const ideaCategories = await this.categoryIdeaService.getCategoriesByIdea(
        idea_id,
      );
      const categories = ideaCategories.map((c) => {
        return c.category.name;
      });

      const ideaAuthorUsername = result['staff_nick_name'];
      const ideaDepartment = result['department'];
      const ideaTitle = idea.title;
      const ideaContent = idea.content;
      const date = new Date(result['created_at']);
      const ideaCreatedTime = date.toLocaleTimeString();
      let month = date.getMonth() + '';
      if (month.length == 1) {
        month = 0 + month;
      }
      let txtDate = date.getFullYear() + '-' + month + '-' + date.getDate();
      const ideaCreatedDate = moment(txtDate, 'YYYY-MM-DD').format(
        'MMM DD, YYYY',
      );

      const commentAuthor = await this.userService.findUserByUserId(
        userData.user_id,
      );
      const authorDetail = commentAuthor.userDetail;
      const commentCreatedTime = newComment.created_at.toLocaleTimeString();
      month = newComment.created_at.getMonth() + '';
      if (month.length == 1) {
        month = 0 + month;
      }
      txtDate =
        newComment.created_at.getFullYear() +
        '-' +
        month +
        '-' +
        newComment.created_at.getDate();
      const commentCreatedDate = moment(txtDate, 'YYYY-MM-DD').format(
        'MMM DD, YYYY',
      );

      sendMailNodemailer(email, 'GIC - New Comment', 'new_comment.hbs', {
        ideaAuthorUsername,
        ideaCreatedDate,
        ideaCreatedTime,
        ideaDepartment,
        ideaTitle,
        ideaContent,
        categories,
        commentAuthorUsername: authorDetail.nick_name,
        commentCreatedDate,
        commentCreatedTime,
        commentDepartment: commentAuthor.department.name,
        commentContent: newComment.content,
      });

      return comment;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkIdeaPost(
    fieldList: DeepPartial<Idea>,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    const idea = await ideaRepository.findOne(fieldList);

    if (idea) {
      return idea;
    } else {
      return false;
    }
  }

  async deleteComment(
    userData: IUserData,
    idea_id: number,
    comment_id: number,
  ) {
    if (
      userData.role_id != EUserRole.STAFF &&
      userData.role_id != EUserRole.QA_COORDINATOR
    ) {
      throw new HttpException(
        ErrorMessage.COMMENT_DELETE_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.ideaRepository.findOne({
      where: { idea_id, is_deleted: EIsDelete.NOT_DELETE },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commentService.deleteComment(userData, comment_id);
  }

  async updateComment(
    userData: IUserData,
    idea_id: number,
    comment_id: number,
    body: VUpdateCommentDto,
  ) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.COMMENT_UPDATE_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.ideaRepository.findOne({
      where: { idea_id, is_deleted: EIsDelete.NOT_DELETE },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commentService.updateComment(
      userData.user_id,
      comment_id,
      body,
    );
  }
}
