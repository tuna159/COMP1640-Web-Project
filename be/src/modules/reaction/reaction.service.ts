import { Reaction } from '@core/database/mysql/entity/reaction.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  async createReaction(
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
        {
          type: body.reaction,
        },
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

    let reaction = await reactionRepository.findOne({
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
}
