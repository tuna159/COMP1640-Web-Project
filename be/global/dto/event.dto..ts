import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  ValidationError,
  Validator,
} from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VCreateEventDto {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(1000)
  content: string;

  @IsDateString()
  first_closure_date: Date;

  @IsDateString()
  final_closure_date: Date;

  @IsOptional()
  @IsNumber()
  department_id: number;
}

export class VUpdateEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  content: string;

  @IsDateString()
  first_closure_date: Date;

  @IsDateString()
  final_closure_date: Date;
}

export class VGetIdeasAttachmentsDto {
  isValid(): Promise<ValidationError[]> {
    const validator = new Validator();
    return validator.validate(this);
  }

  @IsArray()
  @IsNumber({},{each: true})
  file_ids: string;
}