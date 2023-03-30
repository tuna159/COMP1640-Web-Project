import { Event } from '@core/database/mysql/entity/event.entity';
import { IUserData } from '@core/interface/default.interface';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VUpdateEventDto } from 'global/dto/updateEvent.dto';
import {
  DeepPartial,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import moment = require('moment');
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateEventDto } from 'global/dto/createEvent.dto.';
import { DepartmentService } from '@modules/department/department.service';
import { IdeaService } from '@modules/idea/idea.service';
import { Idea } from '@core/database/mysql/entity/idea.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private departmentService: DepartmentService,
    @Inject(forwardRef(() => IdeaService))
    private ideaService: IdeaService,
  ) {}

  async getAllEventsOfDepartment(
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

  async getEventById(event_id: number) {
    return await this.eventRepository.findOne({
      event_id: event_id,
    });
  }

  async checkEventToIdea(event_id: number) {
    return await this.eventRepository.findOne({
      event_id: event_id,
      created_date: LessThanOrEqual(new Date()),
      first_closure_date: MoreThanOrEqual(new Date()),
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

    const department = await this.departmentService.getDepartmentDetails(
      body.department_id,
    );

    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARTMENT_NOT_EXISTS,
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
    const checkAllIdea = await this.ideaService.checkAllIdeaByEvent(event_id);
    const checkIdea = await this.getEventById(event_id);
    if (!checkIdea) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (checkAllIdea.length != 0) {
      throw new HttpException(
        ErrorMessage.CAN_NOT_DELETE_EVENT,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.eventRepository.delete({ event_id });
    return;
  }

  createIdea(userData: IUserData, body: VCreateIdeaDto, event_id: number) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_POST_IDEA,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ideaService.createIdea(userData, body, event_id);
  }

  async updateIdea(
    userData: IUserData,
    event_id: number,
    idea_id: number,
    body: VCreateIdeaDto,
  ) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_POST_IDEA,
        HttpStatus.BAD_REQUEST,
      );
    }
    let event = await this.getEventById(event_id);
    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    event = await this.checkEventToIdea(event_id);
    if (!event) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ideaService.updateIdea(userData, idea_id, body);
  }

  async deleteIdea(
    event_id: number,
    idea_id: number,
    userData: IUserData,
    body: DeepPartial<Idea>,
  ) {
    const checkEvent = await this.getEventById(event_id);

    if (!checkEvent) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const event = await this.checkEventToIdea(event_id);
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_DELETE_IDEA,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_HAS_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.ideaService.deleteIdea(idea_id, userData.user_id, body);
  }
}
