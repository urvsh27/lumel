import { Global, Module } from '@nestjs/common';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';
import { UtilsService } from 'src/constants/utils.service';

@Global()
@Module({
  controllers: [ReportsController],
  providers: [ReportsService, UtilsService],
  exports: [ReportsService],
})
export class AdminModule {}
