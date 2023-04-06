import { IsNotEmpty, IsString } from 'class-validator';

export class VUpdatePassword {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
