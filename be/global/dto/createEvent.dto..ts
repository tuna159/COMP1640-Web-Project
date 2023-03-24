import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class VCreateEventDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsDateString()
  first_closure_date: Date;

  @IsDateString()
  final_closure_date: Date;

  @IsOptional()
  @IsNumber()
  department_id: number;
}
