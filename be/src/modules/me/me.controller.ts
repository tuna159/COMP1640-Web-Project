import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { Body, Controller, Param, Put } from '@nestjs/common';
import { VMeDetail } from 'global/dto/user_detail.dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly userDetailService: UserDetailService) {}

  @Put(":user_id")
  async updateMe(
    @Param('user_id') user_id: string,
    @Body() body: VMeDetail,
  ){
    return await this.userDetailService.updateUserDetail( user_id, body);
  }
}
