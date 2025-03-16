import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof HttpException) {
          return throwError(() => err);
        } else {
          return throwError(
            () =>
              new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: 'Internal server error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        }
      }),
    );
  }
}
