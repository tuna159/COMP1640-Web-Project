import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '@core/database/mysql/entity/tag.entity';

@Module({
  providers: [TagService],
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagController],
  exports: [TagService],
})
export class TagModule {}
