import { IdeaFile } from '@core/database/mysql/entity/file.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class IdeaFileService {
  constructor(
    @InjectRepository(IdeaFile)
    private ideaFileRepository: Repository<IdeaFile>,
  ) {}
  async createIdeaFile(
    body: Array<DeepPartial<IdeaFile>>,
    entityManager?: EntityManager,
  ) {
    const ideaFileRepository = entityManager
      ? entityManager.getRepository<IdeaFile>('file')
      : this.ideaFileRepository;

    await ideaFileRepository
      .createQueryBuilder()
      .insert()
      .into(IdeaFile)
      .values(body)
      .execute();
      console.log(body);
      

    return null;
  }

  async deleteIdeaFile(idea_id: number, entityManager?: EntityManager) {
    const ideaFileRepository = entityManager
      ? entityManager.getRepository<IdeaFile>('file')
      : this.ideaFileRepository;

    return await ideaFileRepository.delete({ idea_id });
  }
}
