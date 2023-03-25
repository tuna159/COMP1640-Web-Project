import { IUserData } from './../../core/interface/default.interface';
import { UserData } from '@core/decorator/user.decorator';
import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { Body, Controller, Param, Put } from '@nestjs/common';
import { VMeDetail } from 'global/dto/user_detail.dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly userDetailService: UserDetailService) {}

  @Put("")
  async updateMe(
    // @Param('user_id') user_id: string,
    @UserData() userData : IUserData,
    @Body() body: VMeDetail,
  ){
    return await this.userDetailService.updateUserDetail( userData.user_id, body);
  }
}
