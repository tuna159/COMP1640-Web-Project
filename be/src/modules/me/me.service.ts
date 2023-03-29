import { User } from '@core/database/mysql/entity/user.entity';
import { UserDetail } from '@core/database/mysql/entity/userDetail.entity';
import { IUserData } from '@core/interface/default.interface';
import { handleBCRYPTCompare, handleBCRYPTHash } from '@helper/utils';
import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { UserService } from '@modules/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VUpdateProfile } from 'global/dto/updateProfile.dto';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(User)
    private readonly meRepository: Repository<User>,
    private connection: Connection,
    private userDetailService: UserDetailService,
    private userService: UserService,
  ) {}

  async updateProfile(userData: IUserData, body: VUpdateProfile) {
    if (userData.role_id == EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.ADMIN_CAN_NOT_UPDATE_PROFILE,
        HttpStatus.BAD_REQUEST,
      );
    }

    // const data = await this.userService.findUserByUserId(userData.user_id);

    // console.log(data);

    // const password = await handleBCRYPTCompare(body.password, data.password);

    // if (password)
    //   throw new HttpException(
    //     ErrorMessage.PLEASE_ENTER_YOUR_NEW_PASSWORD,
    //     HttpStatus.BAD_REQUEST,
    //   );

    await this.connection.transaction(async (manager) => {
      // user table
      // const userParams = new User();

      // userParams.password = await handleBCRYPTHash(body.password);

      // userDetails table
      const userDetailParams = new UserDetail();
      userDetailParams.nick_name = body?.nick_name;
      userDetailParams.birthday = body?.birthdate
        ? new Date(body?.birthdate)
        : undefined;
      userDetailParams.gender = body?.gender;
      userDetailParams.avatar_url = body.avatar_url;

      await Promise.all([
        Object.keys(userDetailParams).length
          ? this.userDetailService.updateUserDetail(
              { user_id: userData.user_id },
              userDetailParams,
              manager,
            )
          : null,
        // this.userService.updateUser(userData.user_id, userParams, manager),
      ]);
    });

    return null;
  }
}
