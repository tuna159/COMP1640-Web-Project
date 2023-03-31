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
  Res,
} from '@nestjs/common';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateEventDto, VUpdateEventDto } from 'global/dto/event.dto.';
import type { Response } from 'express';
import { EventService } from './event.service';
import { Public } from '@core/decorator/public.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  createEvent(@UserData() userData: IUserData, @Body() body: VCreateEventDto) {
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

  @Get(':event_id/download?')
  downloadIdeasByEvent(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Query('category_id') category_id: number,
    @Query('department_id') department_id: number,
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Res() res: Response,
  ) {
    return this.eventService.downloadIdeasByEvent(event_id, res, userData);
  }
}
