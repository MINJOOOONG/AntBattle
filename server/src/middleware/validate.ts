import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const error = {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        };
        _res.status(400).json({ error });
        return;
      }
      next(err);
    }
  };
}
