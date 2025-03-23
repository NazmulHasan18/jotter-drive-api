import { Response, NextFunction, Request } from "express";

import AppError from "../errors/AppError";
import User from "../models/User";
import catchAsync from "../utils/catchAsync";

const checkStorage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const userId = req.user?._id;
   if (!userId) return next(new AppError(401, "User authentication required"));

   const user = await User.findById(userId);
   if (!user) return next(new AppError(404, "User not found"));

   if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next(new AppError(400, "No files uploaded"));
   }

   const totalUploadSize = req.files.reduce((acc, file) => acc + file.size, 0);

   if (user.usedStorage + totalUploadSize > user.totalStorage) {
      return next(new AppError(400, "Insufficient storage available"));
   }

   next();
});

export default checkStorage;
