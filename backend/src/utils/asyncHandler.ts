import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express route handler so that rejected promises are
 * forwarded to the next(error) error-handling middleware instead of
 * causing an unhandled promise rejection.
 *
 * Eliminates no-misused-promises ESLint errors on router.get/post/patch/delete.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
