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
} from '@nestjs/common';
import { VAddComment } from 'global/dto/addComment.dto';
import { VCreateReactionDto } from 'global/dto/reaction.dto';
import { IdeaService } from './idea.service';
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

  @Get(':idea_id/comments')
  async getIdeaCommentsLv1(@Param('idea_id') idea_id: number) {
    return await this.ideaService.getIdeaCommentsLv1(idea_id);
  }

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
  countIdeaComments(@Param('idea_id') idea_id: number) {
    return this.ideaService.countIdeaComments(idea_id);
  }

  @Get(':idea_id/list-reaction')
  getListReaction(@Param('idea_id') idea_id: number) {
    return this.ideaService.getListReaction(idea_id);
  }
}
