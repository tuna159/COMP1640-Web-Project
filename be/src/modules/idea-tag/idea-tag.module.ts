import { IdeaTag } from '@core/database/mysql/entity/ideaTag.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeaTagController } from './idea-tag.controller';
import { IdeaTagService } from './idea-tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaTag])],
  controllers: [IdeaTagController],
  providers: [IdeaTagService],
  exports: [IdeaTagService],
})
export class IdeaTagModule {}
