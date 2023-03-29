import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { REGEX_CONSTANT } from 'enum/default.enum';

export class VUpdatePassword {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(40)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_CONSTANT.PASSWORD)
  @MinLength(8)
  @MaxLength(40)
  newPassword: string;
}
