import { Semester } from '@core/database/mysql/entity/semester.entity';
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EUserRole } from 'enum/default.enum';
import { ErrorMessage } from 'enum/error';
import { VUpdateSemesterDto } from 'global/dto/semester.dto';
import { EntityManager, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import moment = require('moment');

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}

  async getAllSemesters(entityManager?: EntityManager) {
    const semesterRepository = entityManager
      ? entityManager.getRepository<Semester>('semester')
      : this.semesterRepository;
    return await this.semesterRepository.find();
  }

  async getCurrentSemester() {
    return await this.semesterRepository.findOne({
      where: {
        created_date: LessThanOrEqual(new Date()),
        final_closure_date: MoreThanOrEqual(new Date()),
      },
    });
  }

  async getSemesterById(semester_id: number) {
    return await this.semesterRepository.findOne({
      semester_id: semester_id,
    });
  }

  async createSemester(userData: IUserData, body: VUpdateSemesterDto) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_SEMESTER,
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

    const semesterParam = new Semester();
    semesterParam.name = body.name;
    semesterParam.final_closure_date = new Date(body?.final_closure_date);
    semesterParam.first_closure_date = new Date(body?.first_closure_date);

    return await this.semesterRepository.save(semesterParam);
  }

  async updateSemester(
    userData: IUserData,
    semester_id: number,
    body: VUpdateSemesterDto,
  ) {
    if (userData.role_id != EUserRole.ADMIN) {
      throw new HttpException(
        ErrorMessage.YOU_DO_NOT_HAVE_PERMISSION_TO_UPDATE_SEMESTER,
        HttpStatus.BAD_REQUEST,
      );
    }

    const semester = await this.getSemesterById(semester_id);

    if (!semester) {
      throw new HttpException(
        ErrorMessage.SEMESTER_NOT_EXIST,
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

    const createDate = moment(semester.created_date);

    if (createDate > startDate) {
      throw new HttpException(
        ErrorMessage.THE_CREATE_DATE_NEEDS_TO_BE_LESS_THAN_THE_START_DATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const semesterParam = new Semester();
    semesterParam.name = body.name;
    semesterParam.final_closure_date = new Date(body?.final_closure_date);
    semesterParam.first_closure_date = new Date(body?.first_closure_date);

    await this.semesterRepository.update(
      { semester_id: semester_id },
      semesterParam,
    );
    return;
  }

  async deleteSemester(semester_id: number, ) {
    await this.semesterRepository.delete({ semester_id });
    return;
  }
}
