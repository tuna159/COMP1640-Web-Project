import { IdeaFile } from '@core/database/mysql/entity/file.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';

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

  async fileExists(file_id: number, entityManager?: EntityManager) {
    const ideaFileRepository = entityManager
      ? entityManager.getRepository<IdeaFile>('file')
      : this.ideaFileRepository;

    return await ideaFileRepository.count({ file_id });
  }

  async getFilesByEvent(
    event_id: number,
    file_ids: number[],
    entityManager?: EntityManager,
  ) {
    const fileRepository = entityManager
      ? entityManager.getRepository<IdeaFile>('file')
      : this.ideaFileRepository;

    const queryBuilder = fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.idea', 'idea')
      .innerJoin('idea.event', 'event')
      .where('event.event_id = :event_id', { event_id });

    if (file_ids.length != 0) {
      queryBuilder.andWhere('file.file_id IN (:...file_ids )', { file_ids });
    }

    return queryBuilder.getMany();
  }
}
