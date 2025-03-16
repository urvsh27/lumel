import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CommonHTTPerror } from 'src/constants/errors';
import { CustomerEntity } from 'src/database/entities/customer.entity';
import { PgService } from 'src/database/entities/pg/pg.service';
import * as csvParser from 'csv-parser';
import {
  CHUNK_SIZE,
  COMMON_STATUS,
  PAYMENT_METHOD,
  TYPE_WISE_REPORTS,
} from 'src/constants/global';
import * as fs from 'fs';
import { CategoryEntity } from 'src/database/entities/category.entity';
import { ProductEntity } from 'src/database/entities/product.entity';
import { OrderDetailsEntity } from 'src/database/entities/order_details.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { Sequelize } from 'sequelize';
import { UtilsService } from 'src/constants/utils.service';
import { AddressEntity } from 'src/database/entities/address.entity';
import { TypeWiseDataDto } from './reports.dto';
import { pipeline } from 'stream';
const path = require('path');

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly utilsService: UtilsService,
  ) {}

  //#region insert bulk data
  async insertBulkData(req) {
    const file_data = req?.files?.file?.data;
    if (!file_data) CommonHTTPerror({ message: 'File is required.' });

    const UPLOAD_DIR = path.join(__dirname, 'uploads');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

    const csvFile = req.files.file;
    const filePath = path.join(UPLOAD_DIR, csvFile.name);
    fs.writeFileSync(filePath, file_data);

    this.addDataToDB(filePath);
  }

  //#endregion

  //#region
  async addDataToDB(filePath) {
    let dataChunk: any = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          csvParser({
            mapHeaders: ({ header }) =>
              header
                .replace(/^\uFEFF/, '')
                .trim()
                .replace(/^"|"$/g, ''), // User to remove quotes
          }),
        )
        .on('data', async (row) => {
          const prepared_row = this.prepareRow(row);
          dataChunk.push(prepared_row);

          if (dataChunk.length >= CHUNK_SIZE) {
            try {
              await this.insertChunk(dataChunk);
              dataChunk = [];
            } catch (err) {
              console.error('Error inserting chunk:', err);
              reject(err);
              return;
            }
          }
        })
        .on('end', async () => {
          if (dataChunk.length > 0) {
            try {
              await this.insertChunk(dataChunk);
            } catch (err) {
              console.error('Error inserting remaining data:', err);
              reject(err);
              return;
            }
          }
          resolve('Done');
        })
        .on('error', (error) => {
          console.error('Stream error:', error);
          reject(error);
          CommonHTTPerror(error);
        });
    });
  }
  //#endregion

  //#region prepare each row
  private prepareRow(row) {
    const pre = {
      order_id: row['Order ID'],
      product_id: row['Product ID'],
      customer_id: row['Customer ID'],
      product_name: row['Product Name'],
      category_title: row['Category']?.toUpperCase(),
      region: row['Region'],
      date_of_sale: new Date(row['Date of Sale']),
      quantity_sold: row['Quantity Sold'],
      unit_price: row['Unit Price'],
      discount: row['Discount'],
      shipping_cost: row['Shipping Cost'],
      payment_method: PAYMENT_METHOD?.[row?.['Payment Method']],
      customer_name: row['Customer Name'],
      customer_email: row['Customer Email']?.toLowerCase(),
      customer_address: row['Customer Address'],
    };
    return pre;
  }
  //#endregion

  //#region insert data chunk wise
  async insertChunk(dataChunk) {
    let customer_map = {};
    let category_map = {};
    let order_map = {};
    let order_items_map = {};
    let address_map = {};
    for (let i = 0; i < dataChunk.length; i++) {
      const ele = dataChunk[i];
      const customer_id = ele?.customer_id;
      const product_id = ele?.product_id;
      const price = ele?.unit_price;
      const order_id = ele?.order_id;

      // customer data
      if (!customer_map[ele?.customer_email])
        customer_map[ele?.customer_email] = {
          id: customer_id,
          name: ele?.customer_name,
          email: ele?.customer_email,
        };

      // address data
      const address_md5 = this.getCustomerAddressMd5(ele);
      if (!address_map[address_md5])
        address_map[address_md5] = {
          id: address_md5,
          customer_id,
          address: ele?.customer_address,
        };

      // category and products data
      const product_obj = {
        id: product_id,
        price,
        name: ele?.product_name,
        // can add other attributes also
      };
      if (category_map[ele?.category_title]?.length)
        category_map[ele?.category_title].push(product_obj);
      else;
      category_map[ele?.category_title] = [product_obj];

      // order and order items
      const order_item_obj = {
        id: this.getOrderDetailMd5Id(ele),
        product_id,
        price,
        quantity: ele?.quantity_sold,
        order_id,
      };
      const order_product_key = `${order_id}_${product_id}`;
      if (order_map?.[order_id]) {
        if (order_items_map[order_product_key])
          order_items_map[order_product_key].push(order_item_obj);
        else order_items_map[order_product_key] = [order_item_obj];
      } else {
        order_map[order_id] = {
          id: order_id,
          customer_id: ele?.customer_id,
          date_of_sale: ele?.date_of_sale,
          discount: ele?.discount,
          shipping_cost: ele?.shipping_cost,
          payment_method: ele?.payment_method,
          region: ele?.region,
          address_id: address_md5,
        };
        if (order_items_map[order_product_key])
          order_items_map[order_product_key].push(order_item_obj);
        else order_items_map[order_product_key] = [order_item_obj];
      }
    }

    // insert customers
    await this.pgService.bulkCreate(
      CustomerEntity,
      Object.values(customer_map),
      true,
      { updateOnDuplicate: ['name'] },
    );
    customer_map = {};

    // insert addresses
    const address_ids = Object.keys(address_map);
    const find_all_address = await this.pgService.findAll(AddressEntity, {
      attributes: ['id'],
      where: { id: address_ids },
    });
    const find_all_address_map = find_all_address?.reduce((acc: any, adr) => {
      acc[adr?.id] = 1;
      return acc;
    }, {});
    const address_final: any = [];
    for (const adr_md5 of address_ids)
      if (!find_all_address_map?.[adr_md5])
        address_final.push(address_map[adr_md5]);

    try {
      await this.pgService.bulkCreate(AddressEntity, address_final, true);
    } catch (error) {}

    // insert category data // we can use redis for category not using as of now
    const category_titles = Object.keys(category_map);
    const create_cat_data = category_titles.reduce((acc: any, cat) => {
      acc.push({ title: cat });
      return acc;
    }, []);
    await this.pgService.bulkCreate(CategoryEntity, create_cat_data, false, {
      updateOnDuplicate: ['title'],
    });

    // find all categories to get ids for products
    const find_all_categories = await this.pgService.findAll(CategoryEntity, {
      attributes: ['id', 'title'],
      where: { title: category_titles },
    });
    const cat_ids_data = find_all_categories?.reduce((acc: any, cat: any) => {
      acc[cat?.title] = cat.id;
      return acc;
    }, []);

    // insert products
    for (let key = 0; key < category_titles.length; key++) {
      const category = category_titles[key];
      const product_data = category_map[category];
      const category_id = cat_ids_data[category];

      if (product_data?.length) {
        for (const prod of product_data) {
          prod.category_id = category_id;
          prod.status = COMMON_STATUS.SUCCESS;
        }

        await this.pgService.bulkCreate(ProductEntity, product_data, false, {
          updateOnDuplicate: ['name', 'price', 'category_id'],
        });
      }
    }
    category_map = {};

    // insert order items and orders
    const order_details = Object.values(order_map);
    if (!order_details.length) return;

    try {
      await this.pgService.bulkCreate(OrderEntity, order_details, true, {
        updateOnDuplicate: [
          'shipping_cost',
          'payment_method',
          'status',
          'address_id',
          'date_of_sale',
          'discount',
        ],
      });
    } catch (error) {}

    try {
      await this.pgService.bulkCreate(
        OrderDetailsEntity,
        Object.values(order_items_map).flat(1),
        true,
      );
    } catch (error) {}

    // refreshing the total
    const find_all_orders = await this.pgService.findAll(OrderEntity, {
      attributes: ['id'],
      where: { id: order_details?.map((x: any) => x?.id) },
    });
    {
      if (!find_all_orders?.length) return;

      // run trigger to update the total
      await this.pgService.update(
        OrderEntity,
        { is_refresh: Sequelize.literal('is_refresh + 1') },
        {
          where: {
            id: find_all_orders?.map((x) => x?.id),
          },
        },
      );
    }
  }
  //#endregion

  //#region don't change in this function
  private getOrderDetailMd5Id(ele) {
    return this.utilsService.getMD5Hash(
      ele?.order_id + ele?.quantity_sold + ele?.product_id + ele?.unit_price,
    );
  }
  //#endregion

  //#region don't change in this function
  private getCustomerAddressMd5(ele) {
    return this.utilsService.getMD5Hash(
      ele?.customer_address + ele?.customer_id,
    );
  }
  //#endregion

  //#region
  async getTypeWiseData(query: TypeWiseDataDto) {
    const type = +query?.type;
    if (!type || !Object.values(TYPE_WISE_REPORTS).includes(type))
      CommonHTTPerror({ message: 'Provide valid type' });

    const dateFilter = this.utilsService.getDateFilter(query);

    if (type == TYPE_WISE_REPORTS.TOTAL_CUSTOMERS) {
      return await this.pgService.findOne(CustomerEntity, {
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalCustomers'],
        ],
        where: {
          createdAt: dateFilter,
        },
      });
    } else if (type == TYPE_WISE_REPORTS.TOTAL_ORDERS) {
      return await this.pgService.findOne(OrderEntity, {
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalOrders'],
        ],
        where: {
          date_of_sale: dateFilter,
        },
      });
    } else if (type == TYPE_WISE_REPORTS.AVG_ORDER_VALUE) {
      const avg_data = await this.pgService.findOne(OrderEntity, {
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('total')), 'totalAmount'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalOrders'],
        ],
        where: {
          date_of_sale: dateFilter,
        },
      });
      const averageOrderValue =
        avg_data?.totalOrders == 0
          ? 0
          : this.utilsService.getRound(
              avg_data?.totalAmount / avg_data?.totalOrders,
              2,
            );

      return { averageOrderValue };
    }
  }
  //#endregion
}
