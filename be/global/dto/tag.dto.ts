import { IsString, MaxLength, MinLength } from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VCreateTagDto {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(100)
  name: string;
}
