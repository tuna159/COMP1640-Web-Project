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
import { VSignUp } from 'global/dto/signup.dto';
import { VLogin } from 'global/user/dto/login.dto';
import { handleBCRYPTCompare, handleBCRYPTHash } from 'src/helper/utils';
import { Connection } from 'typeorm';

import { UserService } from 'src/modules/user/user.service';
import { IResponseAuth } from './interface';
import { UserDetail } from '@core/database/mysql/entity/userDetail.entity';
import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { IUserData } from '@core/interface/default.interface';
import { EUserRole } from 'enum/default.enum';
import sendMailNodemailer from '@helper/nodemailer';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    public jwtService: JwtService,
    private connection: Connection,
    private userDetailService: UserDetailService,
  ) {}

  async getUserById(user_id: string, role_id) {
    return await this.userService.getUserByUserId(user_id, role_id);
  }

  async returnResponseAuth(userExist): Promise<IResponseAuth> {
    const payloadToken = {
      user_id: userExist.user_id,
      role_id: userExist.role_id,
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

  async signup(userData: IUserData, body: VSignUp) {
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
    userParams.is_deleted = EIsDelete.NOT_DELETE;

    const user = await this.connection.transaction(async (manager) => {
      const newUser = await this.userService.createUser(userParams, manager);

      const userDetailParams = new UserDetail();
      userDetailParams.user_id = newUser.user_id;
      userDetailParams.full_name = body.full_name;
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
        "username": user.userDetail.nick_name ?? user.userDetail.full_name,
      },
    );

    return {
      // token: data.token,
      user_id: user.user_id,
    };
  }
  async logout(userId: string) {
    this.userService.updateUser(userId, {
      token: null,
    });
  }
}
