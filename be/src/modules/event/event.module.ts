import { Event } from '@core/database/mysql/entity/event.entity';
import { IdeaModule } from '@modules/idea/idea.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([Event]),
    forwardRef(() => IdeaModule),
  ],
  exports: [TypeOrmModule, EventService],
})
export class EventModule {}
