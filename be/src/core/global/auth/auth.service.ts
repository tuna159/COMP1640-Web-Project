/* eslint-disable @typescript-eslint/no-var-requires */
import { User } from '@core/database/mysql/entity/user.entity';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VSignUp } from 'global/dto/createAccount';
import { VLogin } from 'global/user/dto/login.dto';
import { handleBCRYPTCompare, handleBCRYPTHash } from 'src/helper/utils';
import { Connection } from 'typeorm';

import { UserService } from 'src/modules/user/user.service';
import { IResponseAuth } from './interface';
import { UserDetail } from '@core/database/mysql/entity/userDetail.entity';
import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { IUserData } from '@core/interface/default.interface';
import sendMailNodemailer from '@helper/nodemailer';
import { EUserRole } from 'enum/default.enum';
import { DepartmentService } from '@modules/department/department.service';
import { Department } from '@core/database/mysql/entity/department.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    public jwtService: JwtService,
    private connection: Connection,
    private userDetailService: UserDetailService,
    private departmentSerivce: DepartmentService,
  ) {}

  async getUserByIdAndRole(user_id: string, role_id: number) {
    return await this.userService.getUserByIdAndRole(user_id, role_id);
  }

  async returnResponseAuth(userExist): Promise<IResponseAuth> {
    const payloadToken = {
      user_id: userExist.user_id,
      role_id: userExist.role_id,
      deparment_id: userExist.department_id,
    };

    const token = this.jwtService.sign(payloadToken, {
      secret: process.env.SECRET_KEY,
      expiresIn: process.env.EXPRIE_TOKEN,
    });

    this.userService.updateUser(userExist.user_id, {
      token,
    });

    return {
      token,
    };
  }

  async login(body: VLogin) {
    const email = await this.userService.getUserByEmail(body.email);

    if (!email)
      throw new HttpException(
        ErrorMessage.GMAIL_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const password = await handleBCRYPTCompare(body.password, email.password);

    if (!password)
      throw new HttpException(
        ErrorMessage.PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const data = await this.returnResponseAuth(email);

    return {
      user_id: email.user_id,
      token: data.token,
    };
  }

  async createAccount(userData: IUserData, body: VSignUp) {
    const email = await this.userService.getUserByEmail(body.email);

    if (email) {
      throw new HttpException(
        ErrorMessage.GMAIL_ALREADY_EXITS,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_RIGHTS_TO_REGISTER_USER_ACCOUNTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userParams = new User();
    userParams.email = body.email;
    userParams.password = await handleBCRYPTHash(body.password);
    userParams.role_id = body.role_id;
    userParams.is_deleted = EIsDelete.NOT_DELETED;
    userParams.department_id =
      body.role_id == EUserRole.ADMIN || body.role_id == EUserRole.QA_MANAGER
        ? null
        : body.department_id;

    const user = await this.connection.transaction(async (manager) => {
      const newUser = await this.userService.createUser(userParams, manager);

      if (newUser.role_id == EUserRole.QA_COORDINATOR) {
        const checkmanage = this.departmentSerivce.getAvailableDepartment(
          newUser.user_id,
        );

        if (!checkmanage) {
          throw new HttpException(
            ErrorMessage.DEPARTMENT_PERMISSION,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const department = await this.departmentSerivce.departmentExists(
        body.department_id,
      );
      if (!department) {
        throw new HttpException(
          ErrorMessage.DEPARTMENT_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      const checkDeparment =
        await this.departmentSerivce.checkManagerDepartment(body.department_id);

      if (!checkDeparment) {
        throw new HttpException(
          ErrorMessage.DEPARTMENT_PERMISSION,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.role_id == EUserRole.QA_COORDINATOR) {
        const deparmentParam = new Department();
        deparmentParam.manager_id = newUser.user_id;

        await this.departmentSerivce.addManagerDeparment(
          body.department_id,
          deparmentParam,
          manager,
        );
      }

      const userDetailParams = new UserDetail();
      userDetailParams.user_id = newUser.user_id;
      userDetailParams.full_name = body.full_name;
      userDetailParams.nick_name = body.nick_name;
      userDetailParams.gender = body.gender;
      userDetailParams.birthday = new Date(body?.birthdate);
      await this.userDetailService.createUserDetail(userDetailParams, manager);

      return await this.userService.findUserByUserId(newUser.user_id, manager);
    });

    sendMailNodemailer(
      body.email,
      'Your GIC Account Has Been Created!',
      'signup_success.hbs',
      {
        username: user.userDetail.nick_name ?? user.userDetail.full_name,
      },
    );

    return {
      user_id: user.user_id,
    };
  }
  async logout(userId: string) {
    this.userService.updateUser(userId, {
      token: null,
    });
  }
}
