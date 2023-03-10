import { Department } from '@core/database/mysql/entity/department.entity';
import { IdeaService } from '@modules/idea/idea.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EIdeaFilter } from 'enum/idea.enum';
import { DepartmentDto } from 'global/dto/department.dto';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly ideaService: IdeaService,
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
    const department = await this.departmentRepository.findOne(department_id);
    return {
      department_id: department.department_id,
      name: department.name,
    };
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
    return this.ideaService.getAllIdeas(null, department_id, null, sorting_setting);
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
