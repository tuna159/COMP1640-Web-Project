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
import { VCreateEventDto, VGetIdeasAttachmentsDto, VUpdateEventDto } from 'global/dto/event.dto.';
import type { Response } from 'express';
import { EventService } from './event.service';
import { VDownloadIdeaDto } from 'global/dto/downloadIdeas.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getEvents(@UserData() userData: IUserData) {
    return this.eventService.getAllEvents(userData);
  }

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
    @Body() body: VDownloadIdeaDto,
    @Res() res: Response,
  ) {
    return this.eventService.downloadIdeasByEvent(
      event_id,
      body,
      res,
      userData,
    );
  }

  @Get(':event_id/attachments')
  getEventIdeasAttachments(
    @UserData() userData: IUserData,
    @Param('event_id') event_id: number,
    @Body() body: VGetIdeasAttachmentsDto,
  ) {
    return this.eventService.getEventIdeasAttachments(
      event_id,
      body,
      userData,
    );
  }

  @Get(':event_id/ideas')
  getIdeasByEvent(
    @Param('event_id') event_id: number,
  ) {
    return this.eventService.getIdeasByEvent(event_id);
  }

  @Get('university')
  getEventsByUniversity(
    @UserData() userData: IUserData,
  ) {
    return this.eventService.getEventsByUniversity(userData);
  }

  @Get(':event_id/dashboard/staff-contribution')
  getStaffContributionOfPublicEvent(
    @Param('event_id') event_id: number,
    @UserData() userData: IUserData,
  ) {
    return this.eventService.getStaffContributionOfPublicEvent(
      event_id,
      userData,
    );
  }

  @Get('dashboard/staff-contribution?')
  getDepartmentIdeasContributionInTime(
    @Query('year') year: number,
    @UserData() userData: IUserData,
  ) {
    return this.eventService.getDepartmentIdeasContributionInTime(
      year,
      userData,
    );
  }
}
