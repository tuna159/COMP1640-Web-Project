import { Comment } from '@core/database/mysql/entity/comment.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { IdeaModule } from '@modules/idea/idea.module';
import { EventModule } from '@modules/event/event.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [
    TypeOrmModule.forFeature([Comment]),
  ],
  exports: [CommentService],
})
export class CommentModule {}
