import { forwardRef, Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '@core/database/mysql/entity/department.entity';
import { IdeaModule } from '@modules/idea/idea.module';
import { EventModule } from '@modules/event/event.module';

@Module({
  providers: [DepartmentService],
  controllers: [DepartmentController],
  imports: [
    TypeOrmModule.forFeature([Department]),
    forwardRef(() => IdeaModule),
    EventModule,
  ],
  exports: [TypeOrmModule, DepartmentService],
})
export class DepartmentModule {}
