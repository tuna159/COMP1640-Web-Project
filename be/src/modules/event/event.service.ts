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
  EntityManager,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { VCreateIdeaDto } from 'global/dto/create-idea.dto';
import { VCreateEventDto, VGetIdeasAttachmentsDto, VUpdateEventDto } from 'global/dto/event.dto.';
import { DepartmentService } from '@modules/department/department.service';
import { IdeaService } from '@modules/idea/idea.service';
import { UserService } from '@modules/user/user.service';
import { join } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import { stringify } from 'csv-stringify';
import { EIsDelete } from 'enum';
import { VDownloadIdeaDto } from 'global/dto/downloadIdeas.dto';
import { ReactionService } from '@modules/reaction/reaction.service';
import { CommentService } from '@modules/comment/comment.service';
import { IdeaFileService } from '@modules/idea-file/idea-file.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private departmentService: DepartmentService,
    @Inject(forwardRef(() => IdeaService))
    private ideaService: IdeaService,
    private userService: UserService,
    private reactionService: ReactionService,
    private commentService: CommentService,
    private readonly fileService: IdeaFileService,
  ) {}

  async getEventsByDepartment(
    department_id: number,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;

    const events = await eventRepository
      .createQueryBuilder('event')
      .innerJoinAndSelect('event.department', 'department')
      .where('department.department_id = :department_id', { department_id })
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

  async getEventsByUniversity(entityManager?: EntityManager) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;

    const events = await eventRepository.find({
      where: {
        department_id: IsNull(),
      },
    });

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

    if (first < new Date()) {
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

    if (body.department_id != null) {
      const department = await this.departmentService.departmentExists(
        body.department_id,
      );
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
    if (first < new Date()) {
      throw new HttpException(
        'First closure date must be greater than current date',
        HttpStatus.BAD_REQUEST,
      );
    }

    const final = new Date(body.final_closure_date);
    if (final < new Date()) {
      throw new HttpException(
        'Final closure date must be greater then current date',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (first >= final) {
      throw new HttpException(
        'First closure date must be less than final closure date',
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
      affected: result.affected,
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
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.ideas', 'ideas')
      .where('event.event_id = :event_id', { event_id })
      .getOne();

    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (event.ideas.length != 0) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EMPTY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await eventRepository.delete(event_id);
    return {
      affected: result.affected,
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
    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    //? Check if an event belongs to the university
    if (event.department_id != null) {
      const user = await this.userService.getUserById(userData.user_id);
      if (user.department_id != event.department_id) {
        throw new HttpException(
          ErrorMessage.EVENT_PERMISSION,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (event.first_closure_date <= new Date()) {
      throw new HttpException(
        ErrorMessage.FIRST_CLOSURE_DATE_UNAVAILABLE,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ideaService.createIdea(userData, body, event_id);
  }

  async downloadIdeasByEvent(
    event_id: number,
    body: VDownloadIdeaDto,
    res: Response,
    userData: IUserData,
  ) {
    if (userData.role_id != EUserRole.QA_MANAGER) {
      throw new HttpException(
        ErrorMessage.DATA_DOWNLOAD_PERMISSION,
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
    if (event.final_closure_date) {
      throw new HttpException(
        ErrorMessage.DATA_DOWNLOAD_DATE_TIME,
        HttpStatus.BAD_REQUEST,
      );
    }

    const start_date = new Date(body.start_date);
    const end_date = new Date(body.end_date);
    if (start_date > end_date) {
      throw new HttpException(
        'Start date must be less than or equal to end date',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      start_date < event.first_closure_date ||
      start_date > event.final_closure_date ||
      end_date < event.first_closure_date ||
      end_date > event.final_closure_date
    ) {
      throw new HttpException(
        'Start date must be between fist and final closure date',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ideas = await this.ideaService.getIdeasOfSystem(
      event_id,
      body.category_id,
      null,
      body.author_department_id,
      false,
      null,
      start_date,
      end_date,
      true,
    );

    const data = [];
    for (const idea of ideas) {
      const row = [];
      const likes = await this.reactionService.countIdeaLikes(idea.idea_id);
      const dislikes = await this.reactionService.countIdeaDislikes(
        idea.idea_id,
      );
      const comments = await this.commentService.countIdeaComments(
        idea.idea_id,
      );
      const event = idea.event;
      const user = idea.user;
      row.push(idea.idea_id);
      row.push(idea.title);
      row.push(idea.content);
      row.push(idea.views);
      row.push(likes);
      row.push(dislikes);
      row.push(comments);
      row.push(idea.is_anonymous);
      row.push(idea.is_deleted);
      row.push(idea.created_at);
      row.push(idea.updated_at);
      row.push(event.event_id);
      row.push(event.name);
      row.push(event.department_id);
      row.push(event.content);
      row.push(event.created_date);
      row.push(event.first_closure_date);
      row.push(event.final_closure_date);
      row.push(user.user_id);
      row.push(user.department.department_id);
      row.push(user.full_name);
      row.push(user.nick_name);
      row.push(user.avatar_url);
      row.push(idea.category.category_id);
      row.push(idea.category.name);
      data.push(row);
    }

    const fileName = 'ideas.csv';
    const path = join(process.cwd(), fileName);
    const writableStream = fs.createWriteStream(path);
    const columns = [
      'idea_id',
      'title',
      'content',
      'views',
      'likes',
      'dislikes',
      'comments',
      'is_anonymous',
      'is_deleted',
      'created_at',
      'updated_at',
      'event_id',
      'event_name',
      'event_department_id',
      'event_content',
      'event_created_date',
      'first_closure_date',
      'final_closure_date',
      'author_id',
      'author_department_id',
      'full_name',
      'nickname',
      'avatar_url',
      'category_id',
      'category_name',
    ];

    try {
      const stringifier = stringify({ header: true, columns: columns });
      data.forEach((row) => {
        stringifier.write(row);
      });
      stringifier.pipe(writableStream);

      const readStream = fs.createReadStream(path);
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      readStream.pipe(res);
    } catch (error) {
      throw new HttpException(
        ErrorMessage.DATA_DOWNLOAD_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getEventIdeasAttachments(
    event_id: number,
    body: VGetIdeasAttachmentsDto,
    userData: IUserData,
  ) {
    if (userData.role_id != EUserRole.QA_MANAGER) {
      throw new HttpException(
        ErrorMessage.GENERAL_PERMISSION,
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
    if (event.final_closure_date) {
      throw new HttpException(
        ErrorMessage.DATA_DOWNLOAD_DATE_TIME,
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const fId of body.file_ids) {
      const count = await this.fileService.fileExists(fId);
      if(count == 0) {
        throw new HttpException(
          `File (id: ${fId}) doesn't exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return this.fileService.getListOfFiles(body.file_ids);
  }

  async getAllEvents(userData: IUserData) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.EVENT_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.eventRepository.find();
  }

  async getIdeasByEvent(
    event_id: number,
  ) {
    const event = await this.eventExists(event_id);

    if (!event) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    const ideas = await this.ideaService.getIdeasOfSystem(event_id);
    return {
      event,
      ideas,
    };
  }

  async getStaffContributionOfPublicEvent(
    event_id: number,
    userData: IUserData,
    entityManager?: EntityManager,
  ) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;

    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.GENERAL_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    const event = await this.eventExists(event_id);
    if (!event || event.department_id != null) {
      throw new HttpException(
        ErrorMessage.EVENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const data = [];
    const departments = await this.departmentService.getAllDepartments();
    for (const d of departments) {
      const result = await eventRepository
        .createQueryBuilder('event')
        .select('idea.user_id')
        .distinct()
        .innerJoin('event.ideas', 'idea')
        .innerJoin('idea.user', 'user')
        .where('event.event_id = :event_id', { event_id })
        .andWhere('user.department_id = :department_id', {
          department_id: d.department_id,
        })
        .andWhere('idea.is_deleted = :is_deleted', {
          is_deleted: EIsDelete.NOT_DELETED,
        })
        .getRawMany();
      const total = await this.departmentService.countTotalStaff(
        d.department_id,
      );
      data.push({
        department_id: d.department_id,
        department_name: d.name,
        total_staff: total,
        staff_contributed: result.length,
      });
    }
    return data;
  }

  async getDepartmentIdeasContributionInTime(
    year: number,
    userData: IUserData,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.GENERAL_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = [];
    const departments = await this.departmentService.getAllDepartments();
    for (const d of departments) {
      const contribution =
        await this.ideaService.getDepartmentIdeasContributionInTime(
          d.department_id,
          year,
        );
      data.push({
        department_id: d.department_id,
        department_name: d.name,
        contribution,
      });
    }
    return data;
  }
}
