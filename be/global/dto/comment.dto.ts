import { IsString, MaxLength, MinLength } from 'class-validator';

export class VUpdateCommentDto {
  @MinLength(1)
  @MaxLength(4096)
  @IsString()
  content: string;
}
