import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  MinLength,
} from 'class-validator';

export class VAddComment {
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  content: string;

  @IsOptional()
  @IsInt()
  parent_id: number;
}
