import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import AppError from "../errors/AppError";

const validateRequest = (schema: ZodSchema<any>) => {
   return (req: Request, res: Response, next: NextFunction) => {
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
         next(validationResult.error);
         return;
      }
      next();
   };
};

export default validateRequest;
