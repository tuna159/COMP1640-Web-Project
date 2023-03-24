import { Event } from '@core/database/mysql/entity/event.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VUpdateEventDto } from 'global/dto/event.dto';
import type { Response, Request } from 'express';
import {stringify} from 'csv-stringify';
import { join } from 'path';
import * as fs from 'fs';
import {
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import moment = require('moment');

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getAllEvents(entityManager?: EntityManager) {
    const eventRepository = entityManager
      ? entityManager.getRepository<Event>('event')
      : this.eventRepository;
    return await eventRepository.find();
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

  async createEvent(userData: IUserData, body: VUpdateEventDto) {
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
        ErrorMessage.THE_START_DATE_NEEDS_TO_BE_LESS_THAN_THE_END_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const eventParam = new Event();
    eventParam.name = body.name;
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

    const startDate = moment(body.first_closure_date);
    const endDate = moment(body.final_closure_date);

    if (startDate > endDate) {
      throw new HttpException(
        ErrorMessage.THE_START_DATE_NEEDS_TO_BE_LESS_THAN_THE_END_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const createDate = moment(event.created_date);

    if (createDate > startDate) {
      throw new HttpException(
        ErrorMessage.THE_CREATE_DATE_NEEDS_TO_BE_LESS_THAN_THE_START_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const eventParam = new Event();
    eventParam.name = body.name;
    eventParam.final_closure_date = new Date(body?.final_closure_date);
    eventParam.first_closure_date = new Date(body?.first_closure_date);

    await this.eventRepository.update({ event_id: event_id }, eventParam);
    return;
  }

  async deleteEvent(event_id: number) {
    await this.eventRepository.delete({ event_id });
    return;
  }

  downloadIdeasByEvent(
    userData: IUserData,
    event_id: number,
    res: Response,
    req: Request,
    entityManager?: EntityManager,
  ): StreamableFile {
    // const ideaRepository = entityManager
    //   ? entityManager.getRepository<Idea>('idea')
    //   : this.ideaRepository;

    if (userData.role_id != EUserRole.QA_MANAGER) {
      throw new HttpException(
        ErrorMessage.DATA_DOWNLOAD_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }
    
    // const event = await this.eventService.getEventById(event_id);
    // if(!event) {
    //   throw new HttpException(
    //     ErrorMessage.event_NOT_EXIST,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // if(event.final_closure_date) {
    //   throw new HttpException(
    //     ErrorMessage.DATA_DOWNLOAD_DATE_TIME,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    
    const data = [
      [ 'John Doe', 30, 'New York' ],
      [ 'Jane Smith', 25, 'San Francisco' ],
      [ 'Bob Johnson', 40, 'Los Angeles' ],
    ];
    
    const fileName = "data.csv";
    const path = join(process.cwd(), 'src', fileName);
    const writableStream = fs.createWriteStream(path);
    const columns = [
      "name",
      "age",
      "city",
    ];
    
    // try {
      const stringifier = stringify({ header: true, columns: columns });
      data.forEach(row => {
        stringifier.write(row);
      });
      stringifier.pipe(writableStream);
    
      const file = fs.createReadStream(path);
      return new StreamableFile(file);



    // } catch (error) {
    //   throw new HttpException(
    //     ErrorMessage.DATA_DOWNLOAD_FAILED,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
  }
}
