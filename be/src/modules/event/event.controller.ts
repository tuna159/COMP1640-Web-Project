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
  Req,
  Res,
} from '@nestjs/common';
import { EIsDelete } from 'enum';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateEventDto, VUpdateEventDto } from 'global/dto/event.dto.';
import { VUpdateIdeaDto } from 'global/dto/update-idea.dto';
import type { Response, Request } from 'express';
import { EventService } from './event.service';

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

  @Get('event/download/:event_id')
  downloadIdeasByEvent(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    })
    // return this.eventService.downloadIdeasByEvent(userData, event_id, res, req);
  }
}
