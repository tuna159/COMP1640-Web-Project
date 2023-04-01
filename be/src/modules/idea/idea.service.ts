import { CategoryIdea } from '@core/database/mysql/entity/categoryIdea.entity';
import { IdeaFile } from '@core/database/mysql/entity/file.entity';
import { IPaginationQuery, IUserData } from '@core/interface/default.interface';
import sendMailNodemailer from '@helper/nodemailer';
import { CategoryIdeaService } from '@modules/category-idea/category-idea.service';
import { CommentService } from '@modules/comment/comment.service';
import { IdeaFileService } from '@modules/idea-file/idea-file.service';
import { ReactionService } from '@modules/reaction/reaction.service';
import { EventService } from '@modules/event/event.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { EIdeaFilter } from 'enum/idea.enum';
import { VAddComment } from 'global/dto/addComment.dto';
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
import { VUpdateCommentDto } from 'global/dto/comment.dto';
import { TagService } from '@modules/tag/tag.service';
import { IdeaTagService } from '@modules/idea-tag/idea-tag.service';
import { IdeaTag } from '@core/database/mysql/entity/ideaTag.entity';
import { Comment } from '@core/database/mysql/entity/comment.entity';
import { UserService } from '@modules/user/user.service';

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
    private readonly userService: UserService,
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
      .innerJoinAndSelect('idea.event', 'event')
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
    const event = idea.event;

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
      event,
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

  async ideaExists(idea_id: number, entityManager?: EntityManager) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    return ideaRepository.findOne({
      idea_id,
      is_deleted: EIsDelete.NOT_DELETED,
    });
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

  async getIdeasOfSystem(
    event_id?: number,
    category_id?: number,
    department_id?: number,
    entireUniversity?: boolean,
    availableEvents?: boolean,
    sorting_setting?: EIdeaFilter,
    startDate?: Date,
    endDate?: Date,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    const query = ideaRepository
      .createQueryBuilder('idea')
      .innerJoinAndSelect('idea.event', 'event')
      .innerJoinAndSelect('idea.user', 'user')
      .innerJoinAndSelect('user.department', 'department')
      .innerJoinAndSelect('user.userDetail', 'userDetail')
      .innerJoinAndSelect('idea.ideaCategories', 'ideaCategory')
      .innerJoinAndSelect('ideaCategory.category', 'category')
      .innerJoinAndSelect('idea.ideaTags', 'ideaTags')
      .innerJoinAndSelect('ideaTags.tag', 'tag')
      .where('idea.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      });

    if (category_id != null) {
      query.andWhere('ideaCategory.category_id = :category_id', {
        category_id,
      });
    }
    if (department_id != null) {
      query.andWhere('event.department_id = :department_id', { department_id });
    } else if (entireUniversity) {
      query.andWhere('event.department_id IS NULL');
    }
    if (event_id != null) {
      query.andWhere('event.event_id = :event_id', { event_id });
    } else if (availableEvents) {
      query.andWhere('event.final_closure_date >= :now', { now: new Date() });
    }

    if (sorting_setting == EIdeaFilter.RECENT_IDEAS) {
      query.orderBy('idea.created_at', 'DESC');
    } else if (sorting_setting == EIdeaFilter.MOST_VIEWED_IDEAS) {
      query.orderBy('idea.views', 'DESC');
    }

    let ideas = await query.getMany();
    if (sorting_setting == EIdeaFilter.MOST_POPULAR_IDEAS) {
      const ideasToSort = [];
      for (const idea of ideas) {
        const likes = await this.reactionService.getIdeaLikes(idea.idea_id);
        const dislikes = await this.reactionService.getIdeaDislikes(
          idea.idea_id,
        );
        idea['point'] = likes - dislikes;
        ideasToSort.push(idea);
      }
      ideas = ideasToSort.sort((a, b) => b.point - a.point);
    }

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

    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.reactionService.createIdeaReaction(
      userData.user_id,
      idea_id,
      body,
    );
  }

  async deleteIdeaReaction(userData: IUserData, idea_id: number) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.IDEA_REACTION_PERMISSION,
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
    return this.reactionService.deleteReaction(userData.user_id, idea_id);
  }

  async getIdeaLikes(idea_id: number) {
    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const likes = await this.reactionService.getIdeaLikes(idea_id);
    return { likes };
  }

  async getIdeaDislikes(idea_id: number) {
    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const dislikes = await this.reactionService.getIdeaDislikes(idea_id);
    return { dislikes };
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

  async getIdeaCommentsLv1(idea_id: number, entityManager?: EntityManager) {
    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.commentService.getIdeaCommentsLv1(idea_id);
  }

  async createComment(
    userData: IUserData, 
    idea_id: number, 
    body: VAddComment,
  ) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.COMMENT_PERMISSION,
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
    const event = await this.eventService.eventExists(idea.event_id);
    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (event.final_closure_date < new Date()) {
      throw new HttpException(
        ErrorMessage.FINAL_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const params = {
        idea_id: idea_id,
        author_id: userData.user_id,
        parent_id: body.parent_id,
        content: body.content,
      };

      const newComment = await this.commentService.createComment(params);
      if (userData.user_id != idea.user_id) {
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
      return newComment;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async countIdeaComments(idea_id: number) {
    const idea = await this.ideaExists(idea_id);
    if (!idea) {
      throw new HttpException(
        ErrorMessage.IDEA_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.commentService.countIdeaComments(idea_id);
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

    const now = new Date();

    const queryBuilder = ideaRepository
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

  // async storeFileStream(fileStream, filename): Promise<string> {
  //   const bucket = admin.storage().bucket();
  //   const file = bucket.file(filename);

  //   // Pipe the file stream to the Firebase storage
  //   await fileStream.pipe(file.createWriteStream());

  //   // Get the download URL for the uploaded file
  //   const downloadURL = await file.getSignedUrl({
  //     action: 'read',
  //     expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  //   });

  //   return downloadURL[0];
  // }

  async getDepartmentStaffContribution(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const ideaRepository = entityManager
      ? entityManager.getRepository<Idea>('idea')
      : this.ideaRepository;

    const ideas = await ideaRepository
      .createQueryBuilder('idea')
      .select('idea.user_id')
      .distinct()
      .innerJoin('idea.user', 'user')
      .innerJoin('user.department', 'department')
      .where('user.department_id = :department_id', {department_id})
      .andWhere('user.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .andWhere('idea.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .getRawMany();
    return ideas.length;
  }
}
