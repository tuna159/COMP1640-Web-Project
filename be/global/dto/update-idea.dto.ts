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
  IsEnum,
} from 'class-validator';
import { EIsDelete } from 'enum';
import { ErrorMessage } from 'enum/error';
import { VFile } from './file.dto';
import { VCreateTagDto } from './tag.dto';

export class VUpdateIdeaDto {
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
  @ValidateNested({ each: true })
  @Type(() => VCreateTagDto)
  tag_names: VCreateTagDto[];

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
