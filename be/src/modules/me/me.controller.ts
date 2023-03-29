import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { Body, Controller, Put } from '@nestjs/common';
import { VUpdatePassword } from 'global/dto/updatePassword.dto';
import { VUpdateProfile } from 'global/dto/updateProfile.dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly userDetailService: UserDetailService,
  ) {}

  @Put()
  async updateProfile(
    @UserData() userData: IUserData,
    @Body() body: VUpdateProfile,
  ) {
    return await this.meService.updateProfile(userData, body);
  }

  @Put('profile/password')
  async updatePassword(
    @UserData() userData: IUserData,
    @Body() body: VUpdatePassword,
  ) {
    return this.meService.updateProfilePassword(userData.user_id, body);
  }
}
