import { Event } from '@core/database/mysql/entity/event.entity';
import { DepartmentModule } from '@modules/department/department.module';
import { IdeaModule } from '@modules/idea/idea.module';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { ReactionModule } from '@modules/reaction/reaction.module';
import { CommentModule } from '@modules/comment/comment.module';
import { IdeaFileModule } from '@modules/idea-file/idea-file.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([Event]),
    DepartmentModule,
    forwardRef(() => IdeaModule),
    UserModule,
    ReactionModule,
    CommentModule,
    IdeaFileModule,
  ],
  exports: [TypeOrmModule, EventService],
})
export class EventModule {}
