import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../utils/logger";

export const validateRequest =
  (schema: {
    params?: ZodSchema;
    query?: ZodSchema;
    body?: ZodSchema;
  }): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validasi params, jika ada
      if (schema.params) {
        try {
          schema.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            const errorMessages = error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            }));

            logger.warn(`Params validation error: ${JSON.stringify(errorMessages)}`);

            res.status(422).json({
              status: "error",
              message: "Invalid request parameters",
              errors: errorMessages,
            });
            return
          }
        }
      }

      // Validasi query, jika ada
      if (schema.query) {
        try {
          schema.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            const errorMessages = error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            }));

            logger.warn(`Query validation error: ${JSON.stringify(errorMessages)}`);

             res.status(422).json({
              status: "error",
              message: "Invalid request query parameters",
              errors: errorMessages,
            });
            return
          }
        }
      }

      // Validasi body, jika ada
      if (schema.body) {
        try {
          schema.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            const errorMessages = error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            }));

            logger.warn(`Body validation error: ${JSON.stringify(errorMessages)}`);

             res.status(422).json({
              status: "error",
              message: "Unprocessable entity: Invalid request body",
              errors: errorMessages,
            });
            return
          }
        }
      }

      next();
    } catch (error) {
      logger.error(`Unexpected error during validation: ${error}`);
      next(error);
    }
  };
