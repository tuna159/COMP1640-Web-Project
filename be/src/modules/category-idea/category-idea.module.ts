import { CategoryIdea } from '@core/database/mysql/entity/categoryIdea.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryIdeaController } from './category-idea.controller';
import { CategoryIdeaService } from './category-idea.service';

@Module({
  controllers: [CategoryIdeaController],
  providers: [CategoryIdeaService],
  imports: [TypeOrmModule.forFeature([CategoryIdea])],
  exports: [CategoryIdeaService],
})
export class CategoryIdeaModule {}
