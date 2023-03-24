import { IsString, IsEmail, IsDateString, IsEnum } from 'class-validator';
import { EDepartment, EGender, EUserRole } from 'enum/default.enum';

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

  @IsEnum(EGender)
  gender: EGender;

  @IsDateString()
  birthdate: Date;

  // @IsString()
  // avatar: string;

  @IsEnum(EDepartment)
  department_id: EDepartment;

  // @IsString()
  // nickname: string;
}
