import { UserData } from '@core/decorator/user.decorator';
import { IUserData } from '@core/interface/default.interface';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { VUpdateSemesterDto } from 'global/dto/semester.dto';
import { SemesterService } from './semester.service';

@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get()
  async getAllSemesters() {
    return await this.semesterService.getAllSemesters();
  }

  @Get(':id')
  getSemesterById(@Param('id') id: string) {
    return this.semesterService.getSemesterById(Number(id));
  }

  @Put(':semester_id')
  updateSemester(
    @UserData() userData: IUserData,
    @Param('semester_id') semester_id: number,
    @Body() body: VUpdateSemesterDto,
  ) {
    return this.semesterService.updateSemester(userData, semester_id, body);
  }

  @Post()
  createSemester( @Body() semester: VUpdateSemesterDto, @UserData() userData: IUserData) {
    return this.semesterService.createSemester(userData, semester);
  }


  @Delete(':id')
  deleteSemester(@Param('id') id: string) {
    return this.semesterService.deleteSemester(Number(id));
  }
}
