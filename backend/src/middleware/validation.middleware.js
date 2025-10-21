import { ZodError } from 'zod';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          error: 'ValidationError',
          details,
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          error: 'ValidationError',
          details,
        });
      }
      next(error);
    }
  };
};
