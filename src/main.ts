import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './config/configuration';
import * as fileUpload from 'express-fileupload';
import { ErrorInterceptor } from './constants/error.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './constants/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(
    fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  );

  await app.listen(PORT ?? 3000);
}
bootstrap();
