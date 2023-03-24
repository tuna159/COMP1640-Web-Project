import { IdeaTag } from '@core/database/mysql/entity/ideaTag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class IdeaTagService {
  constructor(
    @InjectRepository(IdeaTag)
    private readonly ideaTagRepository: Repository<IdeaTag>,
  ) {}

  async createIdeaTag(
    body: Array<DeepPartial<IdeaTag>>,
    entityManager?: EntityManager,
  ) {
    const ideaTagRepository = entityManager
      ? entityManager.getRepository<IdeaTag>('idea_tag')
      : this.ideaTagRepository;

    return await ideaTagRepository
      .createQueryBuilder()
      .insert()
      .into(IdeaTag)
      .values(body)
      .execute();
  }
}
