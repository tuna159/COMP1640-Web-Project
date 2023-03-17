import { IsString, IsOptional, MaxLength } from 'class-validator';

export class VAddComment {
  @IsOptional()
  @MaxLength(4096)
  @IsString()
  content: string | null;
}
