import { Public } from '@core/decorator/public.decorator';
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
} from '@nestjs/common';
import { EIdeaFilter } from 'enum/idea.enum';
import { CreateDepartmentDto, UpdateDepartmentDto } from 'global/dto/department.dto';
import { DepartmentService } from './department.service';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  getAllDepartments() {
    return this.departmentService.getAllDepartments();
  }

  @Get('available')
  getAvailableDepartments(@UserData() userData: IUserData) {
    return this.departmentService.getAvailableDepartments(userData);
  }

  @Get(':department_id')
  getDepartmentById(@Param('department_id') department_id: number) {
    return this.departmentService.getDepartmentDetails(department_id);
  }

  @Post()
  createDepartment(
    @UserData() userData: IUserData,
    @Body() body: CreateDepartmentDto,
  ) {
    return this.departmentService.createDepartment(userData, body);
  }

  @Put(':department_id')
  updateDepartment(
    @UserData() userData: IUserData,
    @Param('department_id') department_id: number, 
    @Body() body: UpdateDepartmentDto,
  ) {
    return this.departmentService.updateDepartment(userData, department_id, body);
  }

  @Delete(':department_id')
  deleteDepartment(
    @UserData() userData: IUserData,
    @Param('department_id') department_id: number,
  ) {
    return this.departmentService.deleteDepartment(userData, department_id);
  }

  @Get(':department_id/events')
  getEventsByDepartment(@Param('department_id') department_id: number) {
    return this.departmentService.getEventsByDepartment(department_id);
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
}
