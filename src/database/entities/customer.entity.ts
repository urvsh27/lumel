import { Table, Column, Model, DataType } from 'sequelize-typescript';

const unique = 'unique_user_email';
@Table({})
export class CustomerEntity extends Model<CustomerEntity> {
  @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique,
  })
  email: string;
}
