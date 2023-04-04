import { Reaction } from '@core/database/mysql/entity/reaction.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { EReactionType } from 'enum/idea.enum';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  async createIdeaReaction(
    user_id: string,
    idea_id: number,
    body: VCreateReactionDto,
    entityManager?: EntityManager,
  ) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    let reaction = await reactionRepository.findOne({
      where: {
        user_id: user_id,
        idea_id: idea_id,
      },
    });

    if (reaction) {
      if (body.reaction == reaction.type) {
        throw new HttpException(
          ErrorMessage.REACTION_ALREADY_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }
      await reactionRepository.update(
        { idea_id, user_id },
        { type: body.reaction },
      );
      reaction.type = body.reaction;
    } else {
      const newReaction = new Reaction();
      newReaction.idea_id = idea_id;
      newReaction.user_id = user_id;
      newReaction.type = body.reaction;
      reaction = await reactionRepository.save(newReaction);
    }

    return reaction;
  }

  async deleteReaction(
    user_id: string,
    idea_id: number,
    entityManager?: EntityManager,
  ) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    const reaction = await reactionRepository.findOne({
      where: {
        user_id: user_id,
        idea_id: idea_id,
      },
    });

    if (!reaction) {
      throw new HttpException(
        ErrorMessage.REACTION_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await reactionRepository.delete({ idea_id, user_id });

    return {
      affected: result.affected,
    };
  }

  async countIdeaLikes(idea_id: number, entityManager?: EntityManager) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    return reactionRepository.count({
      idea_id,
      type: EReactionType.LIKE,
    });
  }

  async countIdeaDislikes(idea_id: number, entityManager?: EntityManager) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    return reactionRepository.count({
      idea_id,
      type: EReactionType.DISLIKE,
    });
  }

  async getListReaction(entityManager?: EntityManager) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    let data = [];

    const queryBuilder = reactionRepository
      .createQueryBuilder('reaction')
      .select()
      .leftJoinAndSelect('reaction.user', 'user')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .where('reaction.type = :type', {
        type: EReactionType.LIKE,
      });

    const [listUser] = await queryBuilder.getManyAndCount();

    data = listUser.map((reaction) => {
      return {
        reaction_type: reaction.type,
        user_id: reaction.user.user_id,
        nick_name: reaction.user.userDetail.nick_name,
        avatar: reaction.user.userDetail.avatar_url,
      };
    });
    return data;
  }

  async getListReactionLikeByDepartment(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    const queryBuilder = reactionRepository
      .createQueryBuilder('reaction')
      .select()
      .leftJoinAndSelect('reaction.idea', 'idea')
      .leftJoinAndSelect('idea.event', 'event')
      .where('reaction.type = :type', {
        type: EReactionType.LIKE,
      })
      .andWhere('event.department_id = :department_id', {
        department_id: department_id,
      });

    const [listReactionLike] = await queryBuilder.getManyAndCount();

    return listReactionLike.length;
  }

  async getListReactionDisLikeByDepartment(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const reactionRepository = entityManager
      ? entityManager.getRepository<Reaction>('reaction')
      : this.reactionRepository;

    const queryBuilder = reactionRepository
      .createQueryBuilder('reaction')
      .select()
      .leftJoinAndSelect('reaction.idea', 'idea')
      .leftJoinAndSelect('idea.event', 'event')
      .where('reaction.type = :type', {
        type: EReactionType.DISLIKE,
      })
      .andWhere('event.department_id = :department_id', {
        department_id: department_id,
      });

    const [listReactionisLike] = await queryBuilder.getManyAndCount();

    return listReactionisLike.length;
  }
}
