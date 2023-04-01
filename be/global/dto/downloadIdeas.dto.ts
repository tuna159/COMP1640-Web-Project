import {
  IsDateString,
  IsInt,
  IsOptional,
} from 'class-validator';

export class VDownloadIdeaDto {
  @IsDateString()
  @IsOptional()
  start_date: Date;

  @IsDateString()
  @IsOptional()
  end_date: Date;

  @IsOptional()
  @IsInt()
  author_department_id: number;

  @IsOptional()
  @IsInt()
  category_id: number;
}