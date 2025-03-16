import { Global, Module } from '@nestjs/common';
import { PgModule } from './pg/pg.module';

@Global()
@Module({
  imports: [PgModule],
  providers: [],
  exports: [PgModule],
})
export class DatabaseModule {}
