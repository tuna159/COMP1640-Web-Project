import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { CommentService } from './comment.service';
import { VUpdateCommentDto } from 'global/dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Delete(':comment_id')
  deleteComment(
    @UserData() userData: IUserData,
    @Param('comment_id') comment_id: number,
  ) {
    return this.commentService.deleteComment(userData, comment_id);
  }

  @Put(':comment_id')
  updateComment(
    @UserData() userData: IUserData,
    @Param('comment_id') comment_id: number,
    @Body() body: VUpdateCommentDto,
  ) {
    return this.commentService.updateComment(userData, comment_id, body);
  }

  @Get(':parent_id')
  getCommentsByParent(
    @Param('parent_id') parent_id: number,
  ) {
    return this.commentService.getCommentsByParent(parent_id);
  }
}
