import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  MinLength,
  ValidateNested,
  ArrayUnique,
  IsInt,
  ArrayMaxSize,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ErrorMessage } from 'enum/error';
import { VFile } from './file.dto';

export class VUpdateIdeaDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(70)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsInt({ each: true })
  category_ids: Array<number>;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => VFile)
  files: VFile[];

  @IsOptional()
  @IsNumber()
  is_anonymous: number;
}
