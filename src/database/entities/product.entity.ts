import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Index,
} from 'sequelize-typescript';
import { CategoryEntity } from './category.entity';

@Table({})
export class ProductEntity extends Model<ProductEntity> {
  @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.DOUBLE, allowNull: true })
  price: number;

  @Index
  @ForeignKey(() => CategoryEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  category_id: number;
}
