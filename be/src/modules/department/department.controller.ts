import { Public } from '@core/decorator/public.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EIdeaFilter } from 'enum/idea.enum';
import { DepartmentDto } from 'global/dto/department.dto';
import { DepartmentService } from './department.service';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Public()
  @Get()
  async getAllDepartments() {
    return await this.departmentService.getAllDepartments();
  }

  @Get(':department_id')
  getDepartmentById(@Param('department_id') department_id: number) {
    return this.departmentService.getDepartmentById(department_id);
  }

  @Get(':department_id/events')
  getEventByDepartment(@Param('department_id') department_id: number) {
    return this.departmentService.getEventByDepartment(department_id);
  }

  @Get(':department_id/ideas?')
  getIdeasByDepartment(
    @Param('department_id') department_id: number,
    @Query('sorting_setting') sorting_setting: EIdeaFilter,
  ) {
    return this.departmentService.getIdeasByDepartment(
      department_id,
      sorting_setting,
    );
  }

  @Get(':department_id/categories/:category_id/ideas?')
  getIdeasByDepartmentAndCategory(
    @Param('department_id') department_id: number,
    @Param('category_id') category_id: number,
    @Query('sorting_setting') sorting_setting: EIdeaFilter,
  ) {
    return this.departmentService.getIdeasByDepartmentAndCategory(
      department_id,
      category_id,
      sorting_setting,
    );
  }

  @Post()
  createDepartment(@Body() department: DepartmentDto) {
    return this.departmentService.createDepartment(department);
  }

  @Put(':id')
  updateDepartment(@Param('id') id: string, @Body() department: DepartmentDto) {
    return this.departmentService.updateDepartment(Number(id), department);
  }

  @Delete(':id')
  deleteDepartment(@Param('id') id: string) {
    return this.departmentService.deleteDepartment(Number(id));
  }
}
