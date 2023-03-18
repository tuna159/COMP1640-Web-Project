import { CategoryIdea } from '@core/database/mysql/entity/categoryIdea.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DeepPartial } from 'typeorm';

@Injectable()
export class CategoryIdeaService {
  constructor(
    @InjectRepository(CategoryIdea)
    private readonly categoryIdeaRepository: Repository<CategoryIdea>,
  ) {}

  async getCategoriesByIdea(idea_id: number, entityManager?: EntityManager) {
    const categoryIdeaRepository = entityManager
      ? entityManager.getRepository<CategoryIdea>('category_idea')
      : this.categoryIdeaRepository;

    const categories = await categoryIdeaRepository
      .createQueryBuilder('category_idea')
      .where('category_idea.idea_id = :idea_id', { idea_id })
      .innerJoinAndSelect('category_idea.category', 'category')
      .getMany();

    return categories;
  }

  async createIdeaCategory(
    body: Array<DeepPartial<CategoryIdea>>,
    entityManager?: EntityManager,
  ) {
    const categoryIdeaRepository = entityManager
      ? entityManager.getRepository<CategoryIdea>('category_idea')
      : this.categoryIdeaRepository;

    return await categoryIdeaRepository
      .createQueryBuilder()
      .insert()
      .into(CategoryIdea)
      .values(body)
      .execute();
  }

  async deleteIdeaCategory(idea_id: number, entityManager?: EntityManager) {
    const categoryIdeaRepository = entityManager
      ? entityManager.getRepository<CategoryIdea>('category_idea')
      : this.categoryIdeaRepository;

    return await categoryIdeaRepository.delete({ idea_id });
  }
}
