import { User } from '@core/database/mysql/entity/user.entity';
import { UserDetail } from '@core/database/mysql/entity/userDetail.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { VMeDetail } from 'global/dto/user_detail.dto';
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

  getUserDetail(user_id: string, entityManager?: EntityManager) {
    const userDetailRepository = entityManager
      ? entityManager.getRepository<UserDetail>('user_detail')
      : this.userDetailRepository;

    return userDetailRepository.findOne({
      user_id: user_id,
    });
  }

  async updateUserDetail (user_id: string, body: VMeDetail,){
    
    const meParams = new UserDetail();
    if (!body) {
      throw new HttpException(
        ErrorMessage.EMPTY_UPDATE_BODY,
        HttpStatus.BAD_REQUEST,
      );
    }
    meParams.full_name = body.full_name;
    meParams.birthday = body.birthdate;
    meParams.gender = body.gender;
    await this.userDetailRepository.update({user_id}, meParams)
    return;
  }
}
