import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ACTIVATE } from 'src/constants/global';
import { CustomerEntity } from './customer.entity';

@Table({})
export class AddressEntity extends Model<AddressEntity> {
  @Column({ type: DataType.STRING(32), allowNull: false, primaryKey: true })
  declare id: string; //md5

  @ForeignKey(() => CustomerEntity)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customer_id: string;

  @Column({ type: DataType.STRING(80), allowNull: true })
  address: string;

  @Column({ type: DataType.SMALLINT, defaultValue: ACTIVATE })
  is_active: number;
}
