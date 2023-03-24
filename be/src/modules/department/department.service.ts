import { Department } from '@core/database/mysql/entity/department.entity';
import { EventService } from '@modules/event/event.service';
import { IdeaService } from '@modules/idea/idea.service';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessage } from 'enum/error';
import { EIdeaFilter } from 'enum/idea.enum';
import { DepartmentDto } from 'global/dto/department.dto';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @Inject(forwardRef(() => IdeaService))
    private ideaService: IdeaService,
    private eventService: EventService,
  ) {}

  async getAllDepartments() {
    const departments = await this.departmentRepository.find();
    const data = departments.map((department) => {
      return {
        department_id: department.department_id,
        name: department.name,
      };
    });
    return data;
  }

  async getDepartmentById(department_id: number) {
    return await this.departmentRepository.findOne(department_id);
  }

  async getEventByDepartment(department_id: number) {
    const department = await this.getDepartmentById(department_id);
    console.log(department);

    if (!department) {
      throw new HttpException(
        ErrorMessage.DEPARMENT_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.eventService.getAllEventsOfDeparment(department_id);
  }

  getIdeasByDepartmentAndCategory(
    department_id?: number,
    category_id?: number,
    sorting_setting?: EIdeaFilter,
  ) {
    return this.ideaService.getAllIdeas(
      null,
      department_id,
      category_id,
      sorting_setting,
    );
  }

  getIdeasByDepartment(department_id: number, sorting_setting: EIdeaFilter) {
    return this.ideaService.getAllIdeas(
      null,
      department_id,
      null,
      sorting_setting,
    );
  }

  async createDepartment(department: DepartmentDto) {
    return await this.departmentRepository.save(department);
  }

  async updateDepartment(department_id: number, department: DepartmentDto) {
    return await this.departmentRepository.update(
      { department_id },
      department,
    );
  }

  async deleteDepartment(department_id: number) {
    return await this.departmentRepository.delete({ department_id });
  }
}
