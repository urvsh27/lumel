import {
  Column,
  DataType,
  ForeignKey,
  Table,
  Model,
} from 'sequelize-typescript';
import { CustomerEntity } from './customer.entity';
import { COMMON_STATUS, DEACTIVATE } from 'src/constants/global';

@Table({})
export class OrderEntity extends Model<OrderEntity> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => CustomerEntity)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customer_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  region: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  total: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  date_of_sale: Date;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  shipping_cost: number;

  @Column({
    type: DataType.SMALLINT,
    allowNull: true,
  })
  payment_method: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: true,
  })
  address_id: string;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
    defaultValue: COMMON_STATUS.NOTHING,
  })
  status: number; 

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  discount: number; // not taking discount entity as of now

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
    defaultValue: DEACTIVATE,
  })
  is_refresh: number; // to update order details by trigger
}
