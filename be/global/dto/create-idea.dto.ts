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
  IsEnum,
} from 'class-validator';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VFile } from './file.dto';

export class VCreateIdeaDto {
  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(1000)
  title: string;

  @IsString()
  @MinLength(1, { message: ErrorMessage.MIN_LENGTH_1 })
  @MaxLength(5000)
  content: string;

  @IsInt()
  category_id: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tag_names: Array<string>;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => VFile)
  files: VFile[];

  @IsOptional()
  @IsEnum(EIsDelete)
  is_anonymous: EIsDelete;
}
