import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import sequelize, {
  BulkCreateOptions,
  FindAttributeOptions,
  GroupOption,
  Includeable,
  Order,
  UpdateOptions,
  WhereOptions,
} from 'sequelize';
import { DB_LUMEL } from 'src/constants/global';
import { CommonHTTPerror } from 'src/constants/errors';

@Injectable()
export class PgService {
  constructor(
    @InjectConnection(DB_LUMEL)
    private readonly seq_lumel: Sequelize,
  ) {}

  //#region  get db connection
  private getDBConnection(modelName) {
    try {
      return this.seq_lumel.getRepository(modelName);
    } catch (error) {}
  }
  //#endregion

  //#region create recode
  async create(modelName, data, t1?: sequelize.Transaction) {
    const repo = this.getDBConnection(modelName);
    if (!repo)
      CommonHTTPerror({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
    try {
      const options = t1 ? { transaction: t1 } : {};
      const created = await repo?.create(data, options);
      return created?.['dataValues'];
    } catch (error) {
      this.throwPrePareErrorDB(
        repo,
        error,
        data,
        error.name === 'SequelizeUniqueConstraintError'
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //#endregion

  //#region common function for db error throwing
  private throwPrePareErrorDB(repo, error, data?, statusCode?) {
    CommonHTTPerror({
      statusCode: statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
      stackError:
        repo.getTableName() +
        ' - ' +
        error?.message +
        '\n\nQuery: ' +
        error?.sql,
    });
  }
  //#endregion

  //#region bulk create
  async bulkCreate(
    modelName,
    data,
    try_single = false,
    options?: BulkCreateOptions,
    t1?: sequelize.Transaction,
  ) {
    const repo = this.getDBConnection(modelName);
    if (!repo)
      CommonHTTPerror({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
    try {
      if (t1)
        if (!options) options = { transaction: t1 };
        else options.transaction = t1;
      try {
        const created = await repo?.bulkCreate(data, options);
        return created?.map((el) => el.get({ plain: true }));
      } catch (e) {
        if (!try_single || !data?.length) throw e;
        else {
          const created: any = [];
          for (let i = 0; i < data.length; i++)
            try {
              const single = data[i];
              const sc = await repo?.create(single, options);
              created.push(sc?.['dataValues']);
            } catch (e) {}
          return created;
        }
      }
    } catch (error) {
      this.throwPrePareErrorDB(
        repo,
        error,
        data,
        error.name === 'SequelizeUniqueConstraintError'
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //#endregion

  //#region findAll
  async findAll(
    modelName,
    options: {
      attributes?: FindAttributeOptions | any;
      where?: WhereOptions;
      include?: Includeable[];
      limit?: number;
      offset?: number;
      order?: Order | any;
      raw?: boolean;
      nest?: boolean;
      distinct?: boolean;
      group?: GroupOption | any;
    },
    t1?: sequelize.Transaction,
  ) {
    const repo = this.getDBConnection(modelName);
    try {
      if (!repo)
        CommonHTTPerror({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      if (typeof options.raw === 'undefined') options.raw = true;
      if (typeof options.nest === 'undefined') options.nest = true;
      if (typeof options.distinct === 'undefined') options.distinct = true;
      if (t1) options['transaction'] = t1;
      return await repo?.findAll(options);
    } catch (error) {
      this.throwPrePareErrorDB(repo, error, { options });
    }
  }
  //#endregion

  //#region find one
  async findOne(
    modelName,
    options: {
      attributes?: FindAttributeOptions | any;
      where?: WhereOptions;
      include?: Includeable | Includeable[];
      order?: Order;
      offset?: number;
      raw?: boolean;
      distinct?: boolean;
      nest?: boolean;
      group?: GroupOption;
    },
    t1?: sequelize.Transaction,
  ): Promise<any> {
    const repo = this.getDBConnection(modelName);
    try {
      if (!repo)
        CommonHTTPerror({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      if (typeof options.raw === 'undefined') options.raw = true;
      if (typeof options.nest === 'undefined') options.nest = true;
      if (typeof options.distinct === 'undefined') options.distinct = true;

      if (t1) options['transaction'] = t1;
      return await repo?.findOne(options);
    } catch (error) {
      console.log(error);
    }
  }
  //#endregion

  //#region update query
  async update(
    modelName,
    data,
    options: UpdateOptions,
    t1?: sequelize.Transaction,
    returning: boolean = false,
  ) {
    const repo = this.getDBConnection(modelName);
    if (!options.where) CommonHTTPerror({});
    if (!options.where['id']) CommonHTTPerror({});
    try {
      const update: any = await repo?.update(data, { ...options, returning });
      return {
        count: update[0],
        updated: update[1]?.map((el) => {
          try {
            return el.get({ plain: true });
          } catch (error) {
            return el;
          }
        }),
        old_value: update[1]?.map((el) => {
          try {
            return el['_previousDataValues'];
          } catch (error) {
            return el;
          }
        }),
      };
    } catch (error) {
      this.throwPrePareErrorDB(
        repo,
        error,
        data,
        error.name === 'SequelizeUniqueConstraintError'
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //#endregion
}
