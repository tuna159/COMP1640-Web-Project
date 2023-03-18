import {
  IsString,
  IsOptional,
  MaxLength,
  Max,
  Min,
  IsInt,
} from 'class-validator';

export class VAddComment {
  @IsOptional()
  @MaxLength(4096)
  @IsString()
  content: string | null;

  @IsOptional()
  @IsInt()
  parent_id: number;

  @IsInt()
  @Min(1)
  @Max(3)
  level: number;
}
