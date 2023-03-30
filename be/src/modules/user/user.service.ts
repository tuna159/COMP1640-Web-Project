import { UserDetail } from '@core/database/mysql/entity/userDetail.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIsDelete } from 'enum';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VSignUp } from 'global/dto/createAccount';
import { VUpdateAccount } from 'global/dto/update-account.dto';
import { VLogin } from 'global/user/dto/login.dto';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { AuthService } from 'src/core/global/auth/auth.service';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async login(body: VLogin) {
    return await this.authService.login(body);
  }

  async createAccount(userData: IUserData, body: VSignUp) {
    return await this.authService.createAccount(userData, body);
  }

  async getUserByEmail(email: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        email,
        is_deleted: EIsDelete.NOT_DELETED,
      },
    });
  }

  async getUserByIdAndRole(
    user_id: string,
    role_id: number,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    return userRepository.findOne({
      where: {
        user_id,
        role_id,
        is_deleted: EIsDelete.NOT_DELETED,
      },
    });
  }

  async getUserById(
    user_id: string,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    return userRepository.findOne({
      where: {
        user_id,
        is_deleted: EIsDelete.NOT_DELETED,
      },
    });
  }

  async checkUserByUserId(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
  }

  async updateUser(
    user_id: string,
    body: DeepPartial<User>,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.update({ user_id }, body);
  }

  async createUser(body: DeepPartial<User>, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    return await userRepository.save(body);
  }

  async findUserByUserId(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      where: {
        user_id: userId,
        is_deleted: EIsDelete.NOT_DELETED,
      },
      relations: ['userDetail', 'department'],
    });
  }

  async getAllUsers(entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    const users = await userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .getMany();

    return users.map((user) => {
      return {
        user_id: user.user_id,
        email: user.email,
        is_deleted: 0,
        role: {
          role_id: user.role_id,
          name: user.role.name,
        },
      };
    });
  }

  async handleLogout(userId: string) {
    await this.authService.logout(userId);
    return null;
  }
  async updateAccount(
    userData: IUserData,
    user_id: string,
    body: VUpdateAccount,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_EDIT_ACCOUNT,
        HttpStatus.BAD_REQUEST,
      );
    }
    const userID = await this.checkUserByUserId(user_id);

    if (!userID) {
      throw new HttpException(
        ErrorMessage.USER_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userParam = new User();
    userParam.role_id = body.role_id;
    userParam.department_id = body.department_id;
    userParam.is_deleted = body.is_deleted;

    await userRepository.update({ user_id: user_id }, userParam);
    return;
  }

  async checkUserDeleteStatus(userId: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    const deleteStatus = await userRepository
      .createQueryBuilder('user')
      .where('user.user_id = :id', { id: userId })
      .andWhere('user.is_deleted = :is_deleted', { is_deleted: 1 })
      .getOne();

    if (!deleteStatus) {
      return 0;
    } else {
      return 1;
    }
  }

  async deleteUser(
    userID: string,
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_RIGHTS_TO_MANAGE_USER_ACCOUNTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;

    const user_ID = await this.checkUserByUserId(userID);

    if (!user_ID) {
      throw new HttpException(
        ErrorMessage.USER_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const user_delete_status = await this.checkUserDeleteStatus(userID);

    if (user_delete_status == 1) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_ALREADY_DELETED,
        HttpStatus.BAD_REQUEST,
      );
    }

    await userRepository
      .createQueryBuilder('user')
      .update(User)
      .set({ is_deleted: EIsDelete.DELETED })
      .where({
        user_id: userID,
      })
      .execute();

    return;
  }

  async getUserPasswordById(user_id: string, entityManager?: EntityManager) {
    const userRepository = entityManager
      ? entityManager.getRepository<User>('user')
      : this.userRepository;
    return await userRepository.findOne({
      select: ['user_id', 'email', 'password'],
      where: {
        user_id,
        isDeleted: EIsDelete.NOT_DELETED,
      },
    });
  }

  async getUserDetail(userData: IUserData, targetUserId: string) {
    const user = await this.findUserByUserId(targetUserId);

    if (!user) {
      throw new HttpException(
        ErrorMessage.USER_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = {
      user_id: user?.user_id,
      nick_name: user?.userDetail?.nick_name,
      avatar_url: user?.userDetail?.avatar_url,
      birthday: user?.userDetail?.birthday,
      email: user.email,
      gender: user.userDetail.gender,
    };
    return data;
  }
}
