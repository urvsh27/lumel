import { HttpException } from '@nestjs/common';

export function CommonHTTPerror(options: {
  message?: string;
  statusCode?: number;
  error?: any;
  stackError?: any;
}) {
  let statusCode = options.statusCode ?? 500;
  const errorObj: any = {
    status: statusCode,
    error: options.error,
    message: options.message,
  };
  errorObj.status = statusCode;
  if (options?.message) errorObj.message = options.message;
  if (options?.stackError) errorObj.stackError = options.stackError;

  throw new HttpException(errorObj, statusCode, {
    cause: options?.error ?? '',
  });
}
