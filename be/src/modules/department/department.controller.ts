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
} from '@nestjs/common';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'global/dto/department.dto';
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
  // @Get(':department_id')
  // getDepartmentById(@Param('department_id') department_id: number) {
  //   return this.departmentService.getDepartmentDetails(department_id);
  // }

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
    return this.departmentService.updateDepartment(
      userData,
      department_id,
      body,
    );
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

  @Get(':department_id/ideas')
  getDepartmentValidIdeas(@Param('department_id') department_id: number) {
    return this.departmentService.getDepartmentValidIdeas(department_id);
  }

  @Get(':department_id/dashboard/staff-contribution')
  getDepartmentStaffContribution(
    @Param('department_id') department_id: number,
    @UserData() userData: IUserData,
  ) {
    return this.departmentService.getDepartmentStaffContribution(
      department_id, userData
    );
  }
}
