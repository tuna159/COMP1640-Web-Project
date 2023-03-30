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
} from '@nestjs/common';
import { EIsDelete } from 'enum';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateEventDto, VUpdateEventDto } from 'global/dto/event.dto.';
import { VUpdateIdeaDto } from 'global/dto/update-idea.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  createEvent(
    @UserData() userData: IUserData,
    @Body() body: VCreateEventDto, 
  ) {
    return this.eventService.createEvent(userData, body);
  }

  @Put(':event_id')
  updateEvent(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Body() body: VUpdateEventDto,
  ) {
    return this.eventService.updateEvent(userData, event_id, body);
  }

  @Delete(':event_id')
  deleteEvent(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
  ) {
    return this.eventService.deleteEvent(userData, event_id);
  }

  @Post(':event_id/ideas')
  createIdea(
    @UserData() userData: IUserData,
    @Body() body: VCreateIdeaDto,
    @Param('event_id') event_id: number,
  ) {
    return this.eventService.createIdea(userData, body, event_id);
  }

  @Put(':event_id/idea/:idea_id')
  updateIdea(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Param('idea_id') idea_id: number,
    @Body() body: VUpdateIdeaDto,
  ) {
    return this.eventService.updateIdea(userData, event_id, idea_id, body);
  }
  
  @Delete(':event_id/idea/:idea_id')
  deleteIdea(
    @Param('event_id') event_id: number,
    @Param('idea_id') idea_id: number,
    @UserData() userData: IUserData,
  ) {
    return this.eventService.deleteIdea(event_id, idea_id, userData, {
      is_deleted: EIsDelete.DELETED,
    });
  }
}
