import { yaml_db_core, yaml_db_pg } from 'src/config/configuration';
import { CustomerEntity } from '../customer.entity';
import { CategoryEntity } from '../category.entity';
import { ProductEntity } from '../product.entity';
import { AddressEntity } from '../address.entity';
import { OrderDetailsEntity } from '../order_details.entity';
import { DB_LUMEL } from 'src/constants/global';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderEntity } from '../order.entity';
import { PgService } from './pg.service';

const entity = [
  CustomerEntity,
  CategoryEntity,
  ProductEntity,
  AddressEntity,
  OrderEntity,
  OrderDetailsEntity,
];

//#region setting up the db connection
// making function to keep other db's connection too
const getDbConn = (
  name,
  db_name_yaml,
  models,
  synchronize = false, // turn this on to create tables if not created
  db_conn_yaml = yaml_db_pg,
) =>
  SequelizeModule.forRootAsync({
    imports: [ConfigModule],
    name,
    useFactory: (configService: ConfigService) => ({
      ...configService.get(db_conn_yaml),
      database: configService.get(db_name_yaml),
      synchronize,
      define: {
        freezeTableName: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
      dialectOptions: {
        ssl: {
          require: true,
        },
      },
      models,
    }),
    inject: [ConfigService],
  });
//#endregion

@Module({
  imports: [getDbConn(DB_LUMEL, yaml_db_core, entity)],
  providers: [PgService],
  exports: [PgService],
})
export class PgModule {}
