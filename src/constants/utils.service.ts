import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { Op } from 'sequelize';
import { CommonHTTPerror } from './errors';

@Injectable()
export class UtilsService {
  constructor() {}

  //#region get md5 string to manage uniqueness
  getMD5Hash(value: string) {
    return CryptoJS.MD5(value).toString();
  }
  //#endregion

  //#region get sequelize date filter
  getDateFilter({ start_date, end_date }): any {
    // validate dates
    const d = this.dateFilter({ start_date, end_date });
    return {
      [Op.gte]: d.start_date,
      [Op.lte]: d.end_date,
    };
  }
  //#endregion

  //#region set start and end date
  dateFilter(date) {
    let start_date: any = new Date();
    let end_date: any = new Date();
    if (date?.start_date && date?.end_date) {
      start_date = new Date(date.start_date);
      end_date = new Date(date.end_date);
      if (start_date == 'Invalid Date' || end_date == 'Invalid Date')
        CommonHTTPerror({ message: 'Invalid date range provided' });
      if (start_date > end_date) {
        const temp = start_date;
        start_date = end_date;
        end_date = temp;
      }
    }
    start_date.setHours(0, 0, 0, 0);
    end_date.setHours(23, 59, 59, 59);
    return { start_date, end_date };
  }
  //#endregion

  //#region get rounded number
  getRound(number, precision = 10) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
  //#endregion
}
