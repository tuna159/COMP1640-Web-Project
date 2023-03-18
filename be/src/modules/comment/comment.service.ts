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
        
    async getIdeaCommentsByParent(
        idea_id: number,
        parent_id: number, 
        entityManager?: EntityManager,
    ) {
        const commentRepository = entityManager
            ? entityManager.getRepository<Comment>('comment')
            : this.commentRepository;

        const comments = await commentRepository
            .createQueryBuilder('comment')
            .innerJoinAndSelect("comment.author", "author")
            .innerJoinAndSelect("author.userDetail", "user_detail")
            .where("idea_id = :idea_id", { idea_id })
            .andWhere(parent_id == null 
                ? "parent_id IS NULL" 
                : "parent_id = :parent_id", { parent_id }
            )
            .andWhere("comment.is_deleted = :is_deleted", { 
                is_deleted: EIsDelete.NOT_DELETE 
            })
            .getMany();

        let data = [];

        data = comments.map(comment => {
            return {
                comment_id: comment.comment_id,
                idea_id: comment.idea_id,
                parent_id: comment.parent_id,
                level: comment.level,
                content: comment.content,
                created_date: comment.created_at,
                updated_date: comment.updated_at,
                author: {
                    "author_id": comment.author_id,
                    "full_name": comment.author.userDetail.full_name,
                    "nickname": comment.author.userDetail.nick_name,
                }
            }
        });

        return data;
    }

    async getCommentsByParent(parent_id?: number, entityManager?: EntityManager) {
      const commentRepository = entityManager
        ? entityManager.getRepository<Comment>('comment')
        : this.commentRepository;
    }
  
    async addIdeaComment(
      value: DeepPartial<Comment>,
      entityManager?: EntityManager,
    ) {
      const commentRepository = entityManager
        ? entityManager.getRepository<Comment>('comment')
        : this.commentRepository;
      return await commentRepository.save(value);
    }

    async deleteComment(
        userData: IUserData,
        comment_id: number,
        entityManager?: EntityManager,
    ) {
        const commentRepository = entityManager
            ? entityManager.getRepository<Comment>('comment')
            : this.commentRepository;

        const comment = await commentRepository.findOne({
            where: { comment_id },
        })

        if(!comment || comment.is_deleted == EIsDelete.DELETED) {
            throw new HttpException(
                ErrorMessage.COMMENT_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
            );
        }

        if(userData.role_id == EUserRole.STAFF 
            && userData.user_id != comment.author_id) {
            throw new HttpException(
                ErrorMessage.COMMENT_DELETE_PERMISSION,
                HttpStatus.BAD_REQUEST,
            );
        }

        const result = await commentRepository.update(
            { comment_id },
            { is_deleted: EIsDelete.DELETED },
        );

        return {
            affected: result.affected!
        };
    }
}
