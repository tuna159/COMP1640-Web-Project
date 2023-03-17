import { Comment } from '@core/database/mysql/entity/comment.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { EntityManager, IsNull, Repository } from 'typeorm';

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
}
