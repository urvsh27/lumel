import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { TypeWiseDataDto } from './reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  //#region insert data to db
  @Post('insertData')
  async bulkInsert(@Req() req) {
    await this.reportsService.insertBulkData(req);
  }
  //#endregion

  //#region customer analysis reports api
  @Get('typeWiseData')
  async typeWiseData(@Query() query: TypeWiseDataDto) {
    return await this.reportsService.getTypeWiseData(query);
  } //#endregion
}
