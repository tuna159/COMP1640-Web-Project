import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { EIdeaFilter } from 'enum/idea.enum';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { VUpdateIdeaDto } from 'global/dto/update-idea.dto';
import { IdeaService } from './idea.service';
import type { Response, Request } from 'express';

@Controller('idea')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Get(':idea_id')
  async getIdeaDetail(
    @UserData() userData: IUserData,
    @Param('idea_id') idea_id: number,
  ) {
    return await this.ideaService.getIdeaDetail(idea_id, userData.user_id);
  }

  @Get('?')
  getIdeasByCurrentSemester(
    @Query('sorting_setting') sorting_setting: EIdeaFilter,
  ) {
    return this.ideaService.getAllIdeas(null, null, null, sorting_setting);
  }

  @Post()
  async createPost(
    @UserData() userData: IUserData,
    @Body() body: VCreateIdeaDto,
  ) {
    return await this.ideaService.createIdea(userData, body);
  }

  @Post(':idea_id/reaction')
  createIdeaReaction(
    @UserData() userData: IUserData,
    @Param('idea_id') idea_id: number,
    @Body() body: VCreateReactionDto,
  ) {
    return this.ideaService.createIdeaReaction(userData, idea_id, body);
  }

  @Delete(':idea_id/reaction')
  deleteIdeaReaction(
    @UserData() userData: IUserData,
    @Param('idea_id') idea_id: number,
  ) {
    return this.ideaService.deleteIdeaReaction(userData, idea_id);
  }

  @Put(':idea_id')
  updateIdea(
    @UserData() userData: IUserData,
    @Param('idea_id') idea_id: number,
    @Body() body: VUpdateIdeaDto,
  ) {
    return this.ideaService.updateIdea(userData, idea_id, body);
  }

  @Get(':idea_id/comments?')
  async getIdeaCommentsByParent(
    @Param('idea_id') idea_id: number,
    @Query('parent_id') parent_id: number,
  ) {
    return await this.ideaService.getIdeaCommentsByParent(idea_id, parent_id);
  }

  @Get('semester/download/:semester_id')
  downloadIdeasBySemester(
    @UserData() userData: IUserData,
    @Param('semester_id') semester_id: number,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return "hello";
    // res.set({
    //   'Content-Type': 'application/json',
    //   'Content-Disposition': 'attachment; filename="package.json"',
    // })
    return this.ideaService.downloadIdeasBySemester(userData, semester_id, res, req);
  }
}
