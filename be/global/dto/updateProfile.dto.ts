import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EGender } from 'enum/default.enum';

export class VUpdateProfile {
  @IsOptional()
  @IsString()
  nick_name: string;

  @IsOptional()
  @IsEnum(EGender)
  gender: EGender;

  @IsOptional()
  @IsDateString()
  birthdate: Date;

  @IsOptional()
  @IsString()
  avatar_url: string;
}
