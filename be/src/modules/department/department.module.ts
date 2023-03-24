import { forwardRef, Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '@core/database/mysql/entity/department.entity';
import { IdeaModule } from '@modules/idea/idea.module';

@Module({
  providers: [DepartmentService],
  controllers: [DepartmentController],
  imports: [
    TypeOrmModule.forFeature([Department]),
    forwardRef(() => IdeaModule),
  ],
  exports: [TypeOrmModule, DepartmentService],
})
export class DepartmentModule {}
