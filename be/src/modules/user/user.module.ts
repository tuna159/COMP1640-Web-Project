import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/database/mysql/entity/user.entity';
import { AuthModule } from 'src/core/global/auth/auth.module';
import { UserDetailModule } from '@modules/user-detail/user-detail.module';
import { DepartmentModule } from '@modules/department/department.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => AuthModule),
    UserDetailModule,
    forwardRef(() => DepartmentModule),
  ],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
