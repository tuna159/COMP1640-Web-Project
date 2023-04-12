import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DB_MYSQL_HOST: string;

  @IsString()
  DB_MYSQL_USER: string;

  @IsNumber()
  DB_MYSQL_LOCAL_PORT: number;

  @IsString()
  DB_MYSQL_PASSWORD: string;

  @IsString()
  DB_MYSQL_NAME: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
