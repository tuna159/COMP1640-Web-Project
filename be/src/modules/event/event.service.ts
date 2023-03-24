import { Event } from '@core/database/mysql/entity/event.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VUpdateEventDto } from 'global/dto/updateEvent.dto';
import {
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import moment = require('moment');
import { VCreateEventDto } from 'global/dto/createEvent.dto.';
import { DepartmentService } from '@modules/department/department.service';
import e = require('express');

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private departmentService: DepartmentService,
  ) {}

  async getAllEventsOfDeparment(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;
    const data = await eventRepository.find({
      where: {
        department_id: department_id,
        created_date: LessThanOrEqual(new Date()),
        final_closure_date: MoreThanOrEqual(new Date()),
      },
    });

    const events = data.map((e) => {
      return {
        event_id: e.event_id,
        name: e.name,
        content: e.content,
        created_date: e.created_date,
        first_closure_date: e.first_closure_date,
        final_closure_date: e.final_closure_date,
      };
    });
    return { events, count_event: data.length };
  }

  async getCurrentEvent() {
    return await this.eventRepository.findOne({
      where: {
        created_date: LessThanOrEqual(new Date()),
        final_closure_date: MoreThanOrEqual(new Date()),
      },
    });
  }

  async getEventById(event_id: number) {
    return await this.eventRepository.findOne({
      event_id: event_id,
    });
  }

  async createEvent(userData: IUserData, body: VCreateEventDto) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_EVENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const startDate = moment(body.first_closure_date);
    const endDate = moment(body.final_closure_date);

    if (startDate > endDate) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_NEEDS_TO_BE_LESS_THAN_FINAL_CLOSURE_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const department = await this.departmentService.getDepartmentById(
      body.department_id,
    );

    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARMENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const eventParam = new Event();
    eventParam.name = body.name;
    eventParam.content = body.content;
    eventParam.department_id = body.department_id;
    eventParam.final_closure_date = new Date(body?.final_closure_date);
    eventParam.first_closure_date = new Date(body?.first_closure_date);

    return await this.eventRepository.save(eventParam);
  }

  async updateEvent(
    userData: IUserData,
    event_id: number,
    body: VUpdateEventDto,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_EVENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const event = await this.getEventById(event_id);

    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const createDate = moment(event.created_date);
    const firstclosureDate = moment(body.first_closure_date);
    const finalclosureDate = moment(body.final_closure_date);

    if (firstclosureDate > finalclosureDate) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_NEEDS_TO_BE_LESS_THAN_FINAL_CLOSURE_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createDate > firstclosureDate) {
      throw new HttpException(
        ErrorMessage.CREATE_DATE_NEEDS_TO_BE_LESS_THAN_THE_START_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (createDate > finalclosureDate) {
      throw new HttpException(
        ErrorMessage.CREATE_DATE_NEEDS_TO_BE_LESS_THAN_FINAL_CLOSURE_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const eventParam = new Event();
    eventParam.name = body.name;
    eventParam.content = body.content;
    eventParam.final_closure_date = new Date(body?.final_closure_date);
    eventParam.first_closure_date = new Date(body?.first_closure_date);

    await this.eventRepository.update({ event_id: event_id }, eventParam);
    return;
  }

  async deleteEvent(event_id: number) {
    await this.eventRepository.delete({ event_id });
    return;
  }
}
