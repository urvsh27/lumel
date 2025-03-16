import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface ResponseInterface<T> {
  data: T;
  message?: '';
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseInterface<T>>
{
  constructor() {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<ResponseInterface<T>>> {
    return next.handle().pipe(
      map((data) => {
        const finalResponse = data?.data ?? data;
        const message = data?.message ?? '';
        if (data?.message) delete data?.message;
        return { data: finalResponse, message };
      }),
    );
  }
}
