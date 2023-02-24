import { UserDetail } from '@core/database/mysql/entity/userDetail.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class UserDetailService {
  constructor(
    @InjectRepository(UserDetail)
    private userDetailRepository: Repository<UserDetail>,
  ) {}
  async createUserDetail(
    body: DeepPartial<UserDetail>,
    entityManager?: EntityManager,
  ) {
    const userDetailRepository = entityManager
      ? entityManager.getRepository<UserDetail>('user_detail')
      : this.userDetailRepository;

    return await userDetailRepository.save(body);
  }
}
