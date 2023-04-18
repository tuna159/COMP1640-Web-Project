import {
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EGender, EUserRole } from 'enum/default.enum';

export class VSignUp {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(EUserRole)
  role_id: EUserRole;

  @IsString()
  full_name: string;

  @IsString()
  nick_name: string;

  @IsEnum(EGender)
  gender: EGender;

  @IsDateString()
  birthdate: Date;

  // @IsString()
  // avatar: string;

  @IsNumber()
  department_id: number;

  // @IsString()
  // nickname: string;
}
