import { Category } from '@core/database/mysql/entity/category.entity';
import { IdeaModule } from '@modules/idea/idea.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [TypeOrmModule.forFeature([Category]), IdeaModule],
  exports: [CategoryService],
})
export class CategoryModule {}
