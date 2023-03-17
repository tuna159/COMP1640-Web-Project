import { JwtAuthGuard } from '@core/global/auth/guard/jwt-auth.guard';
import { HttpExceptionFilter } from '@helper/http-exception.filter';
import { LoggerMiddleware } from '@helper/logger.middleware';
import { ResponseInterceptor } from '@helper/response.interceptor';
import { IdeaModule } from '@modules/idea/idea.module';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from '@helper/env.validation';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { createConnection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration, EConfiguration } from './config/configuration.config';
import { DepartmentModule } from './modules/department/department.module';
import { CategoryModule } from './modules/category/category.module';
import { SemesterModule } from './modules/semester/semester.module';
import { CategoryIdeaModule } from '@modules/category-idea/category-idea.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserDetailModule } from './modules/user-detail/user-detail.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { MeModule } from './modules/me/me.module';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get(EConfiguration.DB_MYSQL_HOST),
        port: +configService.get<number>(EConfiguration.DB_MYSQL_PORT),
        username: configService.get(EConfiguration.DB_MYSQL_USER),
        password: configService.get(EConfiguration.DB_MYSQL_PASSWORD),
        database: configService.get(EConfiguration.DB_MYSQL_NAME),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true,
        autoLoadEntities: true,
        // logging: true,
        // logger: new DatabaseMysqlLogger(),
        timezone: configService.get(EConfiguration.DB_MYSQL_TZ) || '+07:00',
        legacySpatialSupport: false, //fix version mysql 8
      }),

      dataSourceFactory: async (options) => {
        const connection = await createConnection(options);
        console.log('*********************MYSQL connected*****************');
        return connection;
      },
    }),

    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validate,
    }),
    UserModule,
    IdeaModule,
    DepartmentModule,
    CategoryModule,
    SemesterModule,
    CategoryIdeaModule,
    UploadModule,
    UserDetailModule,
    ReactionModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  // exports: [RedisCacheModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
