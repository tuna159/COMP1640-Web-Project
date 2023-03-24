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
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VUpdateEventDto } from 'global/dto/event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(Number(id));
  }

  @Put(':event_id')
  updateEvent(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Body() body: VUpdateEventDto,
  ) {
    return this.eventService.updateEvent(userData, event_id, body);
  }

  @Post()
  createEvent(@Body() event: VUpdateEventDto, @UserData() userData: IUserData) {
    return this.eventService.createEvent(userData, event);
  }

  @Delete(':id')
  deleteEvent(@Param('id') id: string) {
    return this.eventService.deleteEvent(Number(id));
  }

  @Post(':event_id/ideas')
  createIdea(
    @UserData() userData: IUserData,
    @Body() body: VCreateIdeaDto,
  ) {
    return this.eventService.createIdea(userData, body);
  }
}
