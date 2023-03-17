import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { User } from '@core/database/mysql/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetailService } from '@modules/user-detail/user-detail.service';
import { UserDetailModule } from '@modules/user-detail/user-detail.module';

@Module({
  controllers: [MeController],
  providers: [MeService],
  imports: [TypeOrmModule.forFeature([User]), UserDetailModule],
  exports: [MeService],
})
export class MeModule {}
