import { IsEnum, IsNumber } from 'class-validator';
import { EIsDelete } from 'enum';
import { EUserRole } from 'enum/default.enum';

export class VUpdateAccount {
  @IsEnum(EUserRole)
  role_id: EUserRole;

  @IsNumber()
  department_id: number;

  @IsEnum(EIsDelete)
  is_deleted: EIsDelete;
}
