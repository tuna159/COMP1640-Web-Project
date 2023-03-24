import { Tag } from '@core/database/mysql/entity/tag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VCreateTagDto } from 'global/dto/tag.dto';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {}

    createTag(body: VCreateTagDto, entityManager?: EntityManager) {
        const tagRepository = entityManager
            ? entityManager.getRepository<Tag>('tag')
            : this.tagRepository;

        const newTag = new Tag();
        newTag.name = body.name;
        return tagRepository.save(newTag);
    }

    getTagByName(name: string, entityManager?: EntityManager) {
        const tagRepository = entityManager
            ? entityManager.getRepository<Tag>('tag')
            : this.tagRepository;

        return tagRepository.findOne({
            where: { name },
        });
    }
}
