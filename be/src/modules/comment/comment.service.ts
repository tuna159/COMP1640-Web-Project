import { Comment } from '@core/database/mysql/entity/comment.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class CommentService {
  maxLevel: number = 3;

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async commentExist(comment_id: number, entityManager?: EntityManager) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;

    return commentRepository.findOne({
      comment_id,
      is_deleted: EIsDelete.NOT_DELETED,
    });
  }

  async getIdeaCommentsLv1(
    idea_id: number,
    entityManager?: EntityManager,
  ) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;

    const comments = await commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.author', 'author')
      .innerJoinAndSelect('author.userDetail', 'user_detail')
      .where('idea_id = :idea_id', { idea_id })
      // .andWhere('comment.parent_id IS NULL')
      .andWhere('comment.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .getMany();

    return comments.map((comment) => {
      const author = comment.author.userDetail;
      return {
        comment_id: comment.comment_id,
        idea_id: comment.idea_id,
        content: comment.content,
        created_date: comment.created_at,
        updated_date: comment.updated_at,
        parent_id: comment.parent_id,
        level: comment.level,
        author: {
          author_id: comment.author_id,
          full_name: author.full_name,
          nickname: author.nick_name,
          avatar_url: author.avatar_url,
        },
      };
    });
  }

  async getCommentsByParent(
    parent_id: number,
    entityManager?: EntityManager,
  ) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;

    const parent = await this.commentExist(parent_id);
    if(!parent) {
      throw new HttpException(
        ErrorMessage.COMMENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const comments = await commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.author', 'author')
      .innerJoinAndSelect('author.userDetail', 'user_detail')
      .andWhere('parent_id = :parent_id', { parent_id })
      .andWhere('comment.is_deleted = :is_deleted', {
        is_deleted: EIsDelete.NOT_DELETED,
      })
      .getMany();

    return comments.map((comment) => {
      const author = comment.author.userDetail;
      return {
        comment_id: comment.comment_id,
        idea_id: comment.idea_id,
        parent_id: comment.parent_id,
        content: comment.content,
        created_date: comment.created_at,
        updated_date: comment.updated_at,
        author: {
          author_id: comment.author_id,
          full_name: author.full_name,
          nickname: author.nick_name,
          avatar_url: author.avatar_url,
        },
      };
    });
  }

  async createComment(params: any, entityManager?: EntityManager) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;

    const newComment = new Comment();
    newComment.idea_id = params.idea_id!;
    newComment.author_id = params.author_id!;
    newComment.content = params.content!;

    if (params.parent_id != null) {
      const parent = await this.commentExist(params.parent_id);
      if (!parent) {
        throw new HttpException(
          ErrorMessage.COMMENT_NOT_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (parent.level == this.maxLevel) {
        newComment.level = this.maxLevel;
        newComment.parent_id = parent.parent_id;
      } else {
        newComment.level = parent.level + 1;
        newComment.parent_id = parent.comment_id;
      }
    }

    const comment = await commentRepository.save(newComment);
    return {
      idea_id: comment.idea_id,
      author_id: comment.author_id,
      content: comment.content,
      parent_id: comment.parent_id,
      comment_id: comment.comment_id,
      created_at: comment.created_at,
    };
  }

  async deleteComment(
    userData: IUserData,
    comment_id: number,
    entityManager?: EntityManager,
  ) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;

    if (
      userData.role_id != EUserRole.STAFF &&
      userData.role_id != EUserRole.QA_COORDINATOR
    ) {
      throw new HttpException(
        ErrorMessage.COMMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const comment = await commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.idea', 'idea')
      .innerJoinAndSelect('idea.event', 'event')
      .where('comment.comment_id = :comment_id', { comment_id })
      .andWhere('comment.is_deleted = :is_deleted', { 
        is_deleted: EIsDelete.NOT_DELETED, 
      })
      .andWhere('idea.is_deleted = :is_deleted', { 
        is_deleted: EIsDelete.NOT_DELETED, 
      })
      .getOne();

    if (!comment) {
      throw new HttpException(
        ErrorMessage.COMMENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      userData.role_id == EUserRole.STAFF &&
      userData.user_id != comment.author_id
    ) {
      throw new HttpException(
        ErrorMessage.COMMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const event = comment.idea.event;
    if(event.final_closure_date <= new Date()) {
      throw new HttpException(
        ErrorMessage.FINAL_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await commentRepository.update(
      comment_id,
      { is_deleted: EIsDelete.DELETED },
    );
    return {
      affected: result.affected!,
    };
  }

  async updateComment(
    userData: IUserData,
    comment_id: number,
    value: DeepPartial<Comment>,
    entityManager?: EntityManager,
  ) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;

    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.COMMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const comment = await commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.idea', 'idea')
      .innerJoinAndSelect('idea.event', 'event')
      .where('comment.comment_id = :comment_id', { comment_id })
      .andWhere('comment.is_deleted = :is_deleted', { 
        is_deleted: EIsDelete.NOT_DELETED, 
      })
      .andWhere('idea.is_deleted = :is_deleted', { 
        is_deleted: EIsDelete.NOT_DELETED, 
      })
      .getOne();
  
    if (!comment) {
      throw new HttpException(
        ErrorMessage.COMMENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userData.user_id != comment.author_id) {
      throw new HttpException(
        ErrorMessage.COMMENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const event = comment.idea.event;
    if(event.final_closure_date <= new Date()) {
      throw new HttpException(
        ErrorMessage.FINAL_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await commentRepository.update(
      comment_id,
      { content: value.content },
    );
    return {
      affected: result.affected,
    };
  }

  async countIdeaComments(
    idea_id: number,
    entityManager?: EntityManager,
  ) {
    const commentRepository = entityManager
      ? entityManager.getRepository<Comment>('comment')
      : this.commentRepository;
    
    const total = await commentRepository.count({ idea_id });
    return {
      "comments": total,
    };
  }
}
