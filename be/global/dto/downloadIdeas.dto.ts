import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  ValidationError,
  Validator,
} from 'class-validator';

export class VDownloadIdeaDto {
  constructor(
    categoryId: number,
    authorDepartmentId: number,
    startDate: string,
    endDate: string,
  ) {
    this.category_id = categoryId;
    this.author_department_id = authorDepartmentId;
    this.start_date = startDate;
    this.end_date = endDate;
  }

  isValid(): Promise<ValidationError[]> {
    const validator = new Validator();
    return validator.validate(this);
  }

  @IsDateString()
  @IsOptional()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date: string;

  @IsOptional()
  @IsInt()
  author_department_id: number;
  @IsOptional()
  @IsInt()
  category_id: number;
}