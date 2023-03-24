import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Idea } from 'src/core/database/mysql/entity/idea.entity';
import { EventModule } from '@modules/event/event.module';
import { CategoryIdeaModule } from '@modules/category-idea/category-idea.module';
import { IdeaFileModule } from '@modules/idea-file/idea-file.module';
import { ReactionModule } from '@modules/reaction/reaction.module';
import { CommentModule } from '@modules/comment/comment.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  controllers: [IdeaController],
  providers: [IdeaService],
  imports: [
    TypeOrmModule.forFeature([Idea]),
    EventModule,
    CategoryIdeaModule,
    IdeaFileModule,
    ReactionModule,
    CommentModule,
    UserModule,
  ],
  exports: [TypeOrmModule, IdeaService],
})
export class IdeaModule {}
