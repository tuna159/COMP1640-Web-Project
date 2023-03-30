import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string;
}
