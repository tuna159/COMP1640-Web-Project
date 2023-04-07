import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { ErrorMessage } from 'enum/error';

export class VFile {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(3000)
  file_url: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  file_name: string;

  @IsNumber()
  size: number;
}
