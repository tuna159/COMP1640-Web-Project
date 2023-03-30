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

  async createIdeaTags(
    body: Array<DeepPartial<IdeaTag>>,
    entityManager?: EntityManager,
  ) {
    const ideaTagRepository = entityManager
      ? entityManager.getRepository<IdeaTag>('idea_tag')
      : this.ideaTagRepository;
    await ideaTagRepository
      .createQueryBuilder()
      .insert()
      .into(IdeaTag)
      .values(body)
      .execute();
  }

  deleteIdeaTags(idea_id: number, entityManager?: EntityManager) {
    const ideaTagRepository = entityManager
      ? entityManager.getRepository<IdeaTag>('idea_tag')
      : this.ideaTagRepository;

    return ideaTagRepository.delete({ idea_id });
  }
}
