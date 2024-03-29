import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { VSignUp } from 'global/dto/createAccount';
import { VUpdateAccount } from 'global/dto/update-account.dto';
import { VLogin } from 'global/user/dto/login.dto';
import { UserService } from './user.service';
import { Public } from '@core/decorator/public.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: VLogin) {
    return this.userService.login(body);
  }

  @Post('create-account')
  async createAccount(@UserData() userData: IUserData, @Body() body: VSignUp) {
    return this.userService.createAccount(userData, body);
  }

  @Get()
  getAllUser(@UserData() userData: IUserData) {
    return this.userService.getAllUsers(userData);
  }

  @Get(':user_id')
  async getUserDetail(
    @UserData() userData: IUserData,
    @Param('user_id') user_id: string,
  ) {
    return await this.userService.getUserDetail(userData, user_id);
  }

  @Post('/logout')
  async logout(@UserData() userData: IUserData) {
    return await this.userService.handleLogout(userData.user_id);
  }
  @Put(':user_id')
  async updateAccount(
    @UserData() userData: IUserData,
    @Param('user_id') user_id: string,
    @Body() body: VUpdateAccount,
  ) {
    return await this.userService.updateAccount(userData, user_id, body);
  }
}
