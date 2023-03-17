import { IsString, IsDateString, IsEnum } from 'class-validator';
import { EGender} from 'enum/default.enum';

export class VMeDetail {

  @IsString()
  full_name: string;

  @IsEnum(EGender)
  gender: EGender;

  @IsDateString()
  birthdate: Date;
}
