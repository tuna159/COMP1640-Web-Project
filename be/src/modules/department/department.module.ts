import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '@core/database/mysql/entity/department.entity';
import { CategoryIdeaModule } from '@modules/category-idea/category-idea.module';

@Module({
  providers: [DepartmentService],
  controllers: [DepartmentController],
  imports: [TypeOrmModule.forFeature([Department]), CategoryIdeaModule],
})
export class DepartmentModule {}
