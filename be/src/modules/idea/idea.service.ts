import { CategoryIdea } from '@core/database/mysql/entity/categoryIdea.entity';
import { Comment } from '@core/database/mysql/entity/comment.entity';
import { IdeaFile } from '@core/database/mysql/entity/file.entity';
import { IPaginationQuery, IUserData } from '@core/interface/default.interface';
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
import { VCreateTagDto } from 'global/dto/tag.dto';

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
    private readonly tagService: TagService,
    private readonly ideaTagService: IdeaTagService,
  ) {}

  async getIdeaDetails(
    idea_id: number,
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    const idea = await ideaRepository
      .createQueryBuilder('idea')
      .leftJoinAndSelect('idea.files', 'files')
      .innerJoinAndSelect('idea.user', 'user')
      .innerJoinAndSelect('user.userDetail', 'userDetail')
      .innerJoinAndSelect('idea.ideaCategories', 'ideaCategory')
      .innerJoinAndSelect('ideaCategory.category', 'category')
      .where('idea.idea_id = :idea_id', { idea_id })
      .andWhere('idea.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .getOne();

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const files = idea.files.map((file) => {
      return {
        file_id: file.file_id,
        file_url: file.file,
        size: file.size,
      };
    });
    const category = idea.ideaCategories[0];
    const user = idea.user.userDetail;

    //? update idea views only if an idea details is requested
    //? requester must not be the idea author
    if (userData.user_id !== user.user_id) {
      ideaRepository.update(idea_id, { views: idea.views + 1 });
    }

    return {
      idea_id: idea.idea_id,
      title: idea.title,
      content: idea.content,
      views: idea.views,
      is_anonymous: idea.is_anonymous,
      files,
      user: {
        user_id: user.user_id,
        department_id: idea.user.department_id,
        nick_name: user.nick_name,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
      category: {
        category_id: category.category_id,
        name: category.category.name,
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

  async getIdeasOfAvailableEvents(entityManager?: EntityManager) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    const now = new Date();
    const ideas = await ideaRepository
      .createQueryBuilder('idea')
      .innerJoinAndSelect('idea.event', 'event')
      .innerJoinAndSelect('idea.user', 'user')
      .innerJoinAndSelect('user.department', 'department')
      .innerJoinAndSelect('user.userDetail', 'userDetail')
      .innerJoinAndSelect('idea.ideaCategories', 'ideaCategory')
      .innerJoinAndSelect('ideaCategory.category', 'category')
      .innerJoinAndSelect('idea.ideaTags', 'ideaTags')
      .innerJoinAndSelect('ideaTags.tag', 'tag')
      .where('event.final_closure_date >= :now', { now })
      .andWhere('idea.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .getMany();

    return ideas.map((idea) => {
      const event = idea.event;
      const user = idea.user.userDetail;
      const userDepartment = idea.user.department;
      const category = idea.ideaCategories[0];
      const tags = idea.ideaTags.map((i) => {
        return {
          tag_id: i.tag.tag_id,
          name: i.tag.name,
        };
      });

      return {
        idea_id: idea.idea_id,
        title: idea.title,
        content: idea.content,
        views: idea.views,
        is_anonymous: idea.is_anonymous,
        created_at: idea.created_at,
        updated_at: idea.updated_at,
        event: {
          event_id: event.event_id,
          department_id: event.department_id,
          name: event.name,
          content: event.content,
          created_date: event.created_date,
          first_closure_date: event.first_closure_date,
          final_closure_date: event.final_closure_date,
        },
        user: {
          user_id: user.user_id,
          department: {
            department_id: userDepartment.department_id,
            manager_id: userDepartment.manager_id,
            name: userDepartment.name,
          },
          full_name: user.full_name,
          nick_name: user.nick_name,
          avatar_url: user.avatar_url,
        },
        category: {
          category_id: category.category_id,
          name: category.category.name,
        },
        tags,
      };
    });
  }

  async createIdea(
    userData: IUserData,
    body: VCreateIdeaDto,
    event_id: number,
  ) {
    let data: DeepPartial<Idea>;
    try {
      data = await this.connection.transaction(async (manager) => {
        const ideaParams = new Idea();
        ideaParams.user_id = userData.user_id;
        ideaParams.title = body.title;
        ideaParams.content = body.content;
        ideaParams.is_anonymous = body.is_anonymous;
        ideaParams.event_id = event_id;
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
        for (let dto of tagDto) {
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
        }

        const result = await Promise.allSettled([
          this.ideaFileService.createIdeaFile(postFileParams, manager),
          this.categoryIdeaService.createIdeaCategory(
            categoryIdeaParams,
            manager,
          ),
          this.ideaTagService.createIdeaTags(ideaTags, manager),
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

  async ideaExists(idea_id: number, entityManager?: EntityManager) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    return ideaRepository.findOne({
      idea_id,
      is_deleted: EIsDelete.NOT_DELETED,
    });
  }

  async updateIdea(userData: IUserData, idea_id: number, body: VUpdateIdeaDto) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.IDEA_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (idea.user_id != userData.user_id) {
      throw new HttpException(
        ErrorMessage.IDEA_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const event = await this.eventService.eventExists(idea.event_id);
    if (event.first_closure_date <= new Date()) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.connection.transaction(async (manager) => {
        const ideaParams = new Idea();
        ideaParams.title = body.title;
        ideaParams.content = body.content;
        ideaParams.is_anonymous = body.is_anonymous;

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
        const categoryIdeaParam = new CategoryIdea();
        categoryIdeaParam.idea_id = idea_id;
        categoryIdeaParam.category_id = body.category_id;
        categoryIdeaParams.push(categoryIdeaParam);

        const ideaTags = [];
        const tagDto = body.tag_names;
        for (let dto of tagDto) {
          const tag = await this.tagService.getTagByName(dto.name);
          const ideaTag = new IdeaTag();
          if (tag) {
            ideaTag.idea_id = idea_id;
            ideaTag.tag_id = tag.tag_id;
          } else {
            const newTag = await this.tagService.createTag(dto.name);
            ideaTag.idea_id = idea_id;
            ideaTag.tag_id = newTag.tag_id;
          }
          ideaTags.push(ideaTag);
        }

        await Promise.allSettled([
          this.ideaTagService.deleteIdeaTags(idea_id, manager),
          this.ideaFileService.deleteIdeaFile(idea_id, manager),
          this.categoryIdeaService.deleteIdeaCategory(idea_id, manager),
        ]);

        const result = await Promise.allSettled([
          await this.updateIdeaCurrent(
            { idea_id: idea_id },
            ideaParams,
            manager,
          ),
          this.ideaFileService.createIdeaFile(postFileParams, manager),
          this.categoryIdeaService.createIdeaCategory(
            categoryIdeaParams,
            manager,
          ),
          this.ideaTagService.createIdeaTags(ideaTags, manager),
        ]);

        if (result.some((r) => r.status === 'rejected'))
          throw new HttpException(
            'ErrorMessage.UPDATING_IDEA_FAILED',
            HttpStatus.BAD_REQUEST,
          );
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      idea_id: idea_id,
      files: body.files || [],
    };
  }

  async deleteIdea(
    userData: IUserData,
    idea_id: number,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.IDEA_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (idea.user_id != userData.user_id) {
      throw new HttpException(
        ErrorMessage.IDEA_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const event = await this.eventService.eventExists(idea.event_id);
    if (event.first_closure_date <= new Date()) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await ideaRepository.update(idea_id, {
      is_deleted: EIsDelete.DELETED,
    });
    return {
      affected: result.affected,
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
    // if (userData.role_id != EUserRole.STAFF) {
    //   throw new HttpException(
    //     ErrorMessage.CREATE_COMMENT_PERMISSION,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // const idea = await this.getIdeaDetails(idea_id);
    // if (!body.content) {
    //   throw new HttpException(
    //     ErrorMessage.INVALID_PARAM,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // if (body.content === '' || body.content === null) {
    //   throw new HttpException(
    //     ErrorMessage.INVALID_PARAM,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // if (body.parent_id == null && body.level != 1) {
    //   throw new HttpException(
    //     ErrorMessage.INVALID_PARAM,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // const current = new Date();
    // if (idea.event.final_closure_date < current) {
    //   throw new HttpException(
    //     ErrorMessage.FINAL_CLOSURE_DATE_UNAVAILABLE,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // try {
    //   const comment = new Comment();
    //   comment.idea_id = idea_id;
    //   comment.author_id = userData.user_id;
    //   comment.parent_id = body.parent_id;
    //   comment.level = body.level;
    //   comment.content = body.content;
    //   const newComment = await this.commentService.addIdeaComment(comment);
    //   if (userData.user_id !== idea.user_id) {
    //     return newComment;
    //   }
    //   const email = idea.user['email'];
    //   // temporary solution
    //   const result = await this.ideaRepository
    //     .createQueryBuilder('idea')
    //     .select(
    //       'staff_detail.nick_name as staff_nick_name, department.name as department, idea.created_at',
    //     )
    //     .innerJoin('idea.user', 'staff')
    //     .innerJoin('staff.userDetail', 'staff_detail')
    //     .innerJoin('staff.department', 'department')
    //     .where('idea.idea_id = :idea_id', { idea_id })
    //     .getRawOne();
    //   const ideaCategories = await this.categoryIdeaService.getCategoriesByIdea(
    //     idea_id,
    //   );
    //   const categories = ideaCategories.map((c) => {
    //     return c.category.name;
    //   });
    //   const ideaAuthorUsername = result['staff_nick_name'];
    //   const ideaDepartment = result['department'];
    //   const ideaTitle = idea.title;
    //   const ideaContent = idea.content;
    //   const date = new Date(result['created_at']);
    //   const ideaCreatedTime = date.toLocaleTimeString();
    //   let month = date.getMonth() + '';
    //   if (month.length == 1) {
    //     month = 0 + month;
    //   }
    //   let txtDate = date.getFullYear() + '-' + month + '-' + date.getDate();
    //   const ideaCreatedDate = moment(txtDate, 'YYYY-MM-DD').format(
    //     'MMM DD, YYYY',
    //   );
    //   const commentAuthor = await this.userService.findUserByUserId(
    //     userData.user_id,
    //   );
    //   const authorDetail = commentAuthor.userDetail;
    //   const commentCreatedTime = newComment.created_at.toLocaleTimeString();
    //   month = newComment.created_at.getMonth() + '';
    //   if (month.length == 1) {
    //     month = 0 + month;
    //   }
    //   txtDate =
    //     newComment.created_at.getFullYear() +
    //     '-' +
    //     month +
    //     '-' +
    //     newComment.created_at.getDate();
    //   const commentCreatedDate = moment(txtDate, 'YYYY-MM-DD').format(
    //     'MMM DD, YYYY',
    //   );
    //   sendMailNodemailer(email, 'GIC - New Comment', 'new_comment.hbs', {
    //     ideaAuthorUsername,
    //     ideaCreatedDate,
    //     ideaCreatedTime,
    //     ideaDepartment,
    //     ideaTitle,
    //     ideaContent,
    //     categories,
    //     commentAuthorUsername: authorDetail.nick_name,
    //     commentCreatedDate,
    //     commentCreatedTime,
    //     commentDepartment: commentAuthor.department.name,
    //     commentContent: newComment.content,
    //   });
    //   return comment;
    // } catch (error) {
    //   console.log(error);
    //   throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    // }
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
      where: { idea_id, is_deleted: EIsDelete.NOT_DELETED },
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
      where: { idea_id, is_deleted: EIsDelete.NOT_DELETED },
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

  async updatePostByUserCreated(
    condition: object,
    body: DeepPartial<Idea>,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;
    return await ideaRepository.update(condition, body);
  }

  async searchIdea(
    userData: IUserData,
    query: IPaginationQuery,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    let data = [];

    const queryBuilder = ideaRepository
      .createQueryBuilder('idea')
      .select()
      .leftJoinAndSelect('idea.ideaTags', 'ideaTags')
      .leftJoinAndSelect('ideaTags.tag', 'tag')
      .where('idea.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      });

    if (query.search_key && query.search_key != '') {
      const searchKey = query.search_key.trim().toLowerCase();
      queryBuilder.andWhere(
        '((LOWER(idea.content) LIKE :searchKey) OR (LOWER(tag.name) LIKE :searchKey))',
        {
          searchKey: `%${searchKey}%`,
        },
      );
    }
    const [listIdea] = await queryBuilder.getManyAndCount();

    data = listIdea.map((idea) => {
      return {
        idea_id: idea.idea_id,
        tilte: idea.title,
        tag: idea.ideaTags.map((e) => {
          return {
            tag: e.tag.name,
          };
        }),
      };
    });

    return data;
  }
  async getListReaction(idea_id: number) {
    const idea = await this.ideaRepository.findOne({
      where: { idea_id: idea_id, is_deleted: EIsDelete.NOT_DELETED },
    });

    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.reactionService.getListReaction();
  }
}
