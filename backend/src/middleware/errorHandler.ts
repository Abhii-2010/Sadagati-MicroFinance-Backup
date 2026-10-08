import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  const statusCode = (err as { statusCode?: number })?.statusCode || 500;
  const message =
    err instanceof Error
      ? (isDev || statusCode < 500 ? err.message : 'Internal Server Error')
      : 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  });
}
