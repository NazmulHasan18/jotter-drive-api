import { ErrorRequestHandler } from "express";
import config from "../config";
import AppError from "./AppError";
import { ZodError, ZodIssue } from "zod";

type TErrorSources = {
   path: string;
   message: string;
}[];

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
   let statusCode = 500;
   let message = "Something went wrong!";
   let errorSources: TErrorSources = [
      {
         path: "",
         message: "Something went wrong",
      },
   ];
   if (err instanceof ZodError || err.name === "ZodError") {
      const zError: TErrorSources = err.issues.map((issue: ZodIssue) => {
         return {
            path: issue?.path[issue.path.length - 1],
            message: issue.message,
         };
      });

      errorSources = zError;
   } else if (err instanceof AppError) {
      statusCode = err?.statusCode;
      message = err.message;
      errorSources = [
         {
            path: "",
            message: err?.message,
         },
      ];
   } else if (err instanceof Error) {
      message = err.message;
      errorSources = [
         {
            path: "ee",
            message: err?.message,
         },
      ];
   }

   //ultimate return
   res.status(statusCode).json({
      success: false,
      message,
      errorSources,
      err,
      stack: config.node_env === "development" ? err?.stack : null,
   });
   return;
};

export default globalErrorHandler;
