import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VCreateEventDto {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  name: string;

  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  content: string;

  @IsDateString()
  first_closure_date: Date;

  @IsDateString()
  final_closure_date: Date;

  @IsOptional()
  @IsNumber()
  department_id: number;
}
