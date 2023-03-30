import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { User } from '@core/database/mysql/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetailModule } from '@modules/user-detail/user-detail.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  controllers: [MeController],
  providers: [MeService],
  imports: [TypeOrmModule.forFeature([User]), UserDetailModule, UserModule],
  exports: [MeService],
})
export class MeModule {}
