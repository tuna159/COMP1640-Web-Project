import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  manager_id: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  manager_id: string;
}
