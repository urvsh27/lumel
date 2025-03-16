import {
    Column,
    DataType,
    Index,
    Model,
    Table,
} from 'sequelize-typescript';
import { ACTIVATE } from 'src/constants/global';

@Table({})
export class CategoryEntity extends Model<CategoryEntity> {
    @Column({
        type: DataType.SMALLINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    declare id: number;

    @Column({ type: DataType.STRING(80), allowNull: false, unique  : 'category_title' })
    title: string;

    @Column({ type: DataType.SMALLINT, defaultValue: ACTIVATE })
    is_active: number;
}