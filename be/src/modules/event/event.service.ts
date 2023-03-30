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
import {
  DeepPartial,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateEventDto, VUpdateEventDto } from 'global/dto/event.dto.';
import { DepartmentService } from '@modules/department/department.service';
import { IdeaService } from '@modules/idea/idea.service';
import { Idea } from '@core/database/mysql/entity/idea.entity';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private departmentService: DepartmentService,
    @Inject(forwardRef(() => IdeaService))
    private ideaService: IdeaService,
    private userService: UserService,
  ) {}

  async getEventsByDepartment(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;

    const events = await eventRepository
      .createQueryBuilder("event")
      .innerJoinAndSelect("event.department", "department")
      .where("department.department_id = :department_id", { department_id })
      .getMany();

    return events.map((e) => {
      return {
        event_id: e.event_id,
        name: e.name,
        content: e.content,
        created_date: e.created_date,
        first_closure_date: e.first_closure_date,
        final_closure_date: e.final_closure_date,
        department: e.department,
      };
    });
  }

  async eventExists(event_id: number) {
    return this.eventRepository.findOne(event_id);
  }

  async checkEventToIdea(event_id: number) {
    return await this.eventRepository.findOne({
      event_id: event_id,
      created_date: LessThanOrEqual(new Date()),
      first_closure_date: MoreThanOrEqual(new Date()),
    });
  }

  async createEvent(
    userData: IUserData, 
    body: VCreateEventDto,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.EVENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    //? Date time is automatically converted to UTC at Dto
    //? Get both date and time as UTC format
    const first = new Date(body.first_closure_date);
    const final = new Date(body.final_closure_date);
    
    if(first < new Date()) {
      throw new HttpException(
        ErrorMessage.INVALID_FIRST_CLOSURE_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (first > final) {
      throw new HttpException(
        ErrorMessage.INVALID_CLOSURE_DATES,
        HttpStatus.BAD_REQUEST,
      );
    }

    if(body.department_id != null) {
      const department = await this.departmentService
          .departmentExists(body.department_id);
      if (!department) {
        throw new HttpException(
          ErrorMessage.DEPARTMENT_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      } 
    }

    const event = new Event();
    event.name = body.name;
    event.content = body.content;
    event.department_id = body.department_id;
    event.first_closure_date = new Date(body?.first_closure_date);
    event.final_closure_date = new Date(body?.final_closure_date);

    return eventRepository.save(event);
  }

  async updateEvent(
    userData: IUserData,
    event_id: number,
    body: VUpdateEventDto,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.EVENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const event = await this.eventExists(event_id);
    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const first = new Date(body.first_closure_date);
    if(first < new Date()) {
      throw new HttpException(
        "First closure date must be greater than current date",
        HttpStatus.BAD_REQUEST,
      );
    }

    const final = new Date(body.final_closure_date);
    if (final < new Date()) {
      throw new HttpException(
        "Final closure date must be greater then current date",
        HttpStatus.BAD_REQUEST,
      );
    }

    if(first >= final) {
      throw new HttpException(
        "First closure date must be less than final closure date",
        HttpStatus.BAD_REQUEST,
      );
    }

    const newEvent = new Event();
    newEvent.name = body.name;
    newEvent.content = body.content;
    newEvent.final_closure_date = new Date(body.final_closure_date);
    newEvent.first_closure_date = new Date(body.first_closure_date);
    const result = await eventRepository.update(event_id, newEvent);

    return {
      "affected": result.affected,
    };
  }

  async deleteEvent(
    userData: IUserData,
    event_id: number,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;
    
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.EVENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const event = await eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.ideas", "ideas")
      .where("event.event_id = :event_id", { event_id })
      .getOne();

    if(!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if(event.ideas.length != 0) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EMPTY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await eventRepository.delete(event_id);
    return {
      "affected": result.affected,
    };
  }

  async createIdea(
    userData: IUserData,
    body: VCreateIdeaDto,
    event_id: number,
  ) {
    if (userData.role_id != EUserRole.STAFF) {
      throw new HttpException(
        ErrorMessage.IDEA_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const event = await this.eventExists(event_id);
    if(!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    //? Check if an event belongs to the university
    if(event.department_id != null) {
      const user = await this.userService.getUserById(userData.user_id);
      if(user.department_id != event.department_id) {
        throw new HttpException(
          ErrorMessage.EVENT_PERMISSION,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if(event.first_closure_date <= new Date()) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ideaService.createIdea(userData, body, event_id);
  }
}
