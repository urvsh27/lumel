import {
  Column,
  DataType,
  ForeignKey,
  Table,
  Model,
} from 'sequelize-typescript';
import { ProductEntity } from './product.entity';
import { OrderEntity } from './order.entity';

@Table({})
export class OrderDetailsEntity extends Model<OrderDetailsEntity> {
  @Column({
    type: DataType.STRING, 
    primaryKey: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => OrderEntity)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  order_id: number;

  @ForeignKey(() => ProductEntity)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  product_id: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  quantity: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  price: number;
}
