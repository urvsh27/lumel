import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/entities/database.module';
import { AdminModule } from './admin/admin.module';
import { RouterModule, Routes } from '@nestjs/core';
import { UtilsService } from './constants/utils.service';

const routes: Routes = [{ path: '/admin', module: AdminModule }];

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    RouterModule.register(routes),
    DatabaseModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, UtilsService],
})
export class AppModule {}
