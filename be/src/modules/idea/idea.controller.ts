import { UserData } from '@core/decorator/user.decorator';
import { IPaginationQuery, IUserData } from '@core/interface/default.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { VAddComment } from 'global/dto/addComment.dto';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { IdeaService } from './idea.service';
import type { Response, Request } from 'express';
import { VUpdateCommentDto } from 'global/dto/comment.dto';
import { VUpdateIdeaDto } from 'global/dto/update-idea.dto';

@Controller('idea')
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Get('/search')
  async searchIdea(
    @UserData() userData: IUserData,
    @Query() query: IPaginationQuery,
  ) {
    return await this.ideaService.searchIdea(userData, query);
  }

  @Get(':idea_id')
  async getIdeaDetails(
    @Param('idea_id') idea_id: number,
    @UserData() userData: IUserData,
  ) {
    return await this.ideaService.getIdeaDetails(idea_id, userData);
  }

  @Get()
  getIdeasOfAvailableEvents() {
    return this.ideaService.getIdeasOfAvailableEvents();
  }

  @Put(':idea_id')
  updateIdea(
    @UserData() userData: IUserData,
    @Param('idea_id') idea_id: number,
    @Body() body: VUpdateIdeaDto,
  ) {
    return this.ideaService.updateIdea(userData, idea_id, body);
  }

  @Delete(':idea_id')
  deleteIdea(
    @UserData() userData: IUserData,
    @Param('idea_id') idea_id: number,
  ) {
    return this.ideaService.deleteIdea(userData, idea_id);
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

  @Get(':idea_id/likes')
  getIdeaLikes(@Param('idea_id') idea_id: number) {
    return this.ideaService.getIdeaLikes(idea_id);
  }

  @Get(':idea_id/dislikes')
  getIdeaDislikes(@Param('idea_id') idea_id: number) {
    return this.ideaService.getIdeaDislikes(idea_id);
  }
  
  @Get('event/download/:event_id')
  downloadIdeasByEvent(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return 'hello';
    // res.set({
    //   'Content-Type': 'application/json',
    //   'Content-Disposition': 'attachment; filename="package.json"',
    // })
    return this.ideaService.downloadIdeasByEvent(userData, event_id, res, req);
  }

  // @Get(':idea_id/comments/:parent_id')
  // async getCommentsByParent(
  //   @Param('idea_id') idea_id: number,
  //   @Param('parent_id') parent_id: number,
  // ) {
  //   return await this.ideaService.getCommentsByParent(idea_id, parent_id);
  // }

  @Post('/:idea_id/comments')
  async createComment(
    @UserData() userData: IUserData,
    @Body() body: VAddComment,
    @Param(
      'idea_id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
      }),
    )
    idea_id: number,
  ) {
    return this.ideaService.createComment(userData, idea_id, body);
  }

  @Get(':idea_id/comments/total')
  countIdeaComments(
    @Param('idea_id') idea_id: number,
  ) {
    return this.ideaService.countIdeaComments(idea_id);
  }
}
