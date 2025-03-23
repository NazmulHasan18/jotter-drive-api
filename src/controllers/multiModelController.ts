import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import mongoose from "mongoose";
import moment from "moment";
import File from "../models/Files";
import Folder from "../models/Folder";
import User from "../models/User";
import AppError from "../errors/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

type FileQueryFilter = {
   type?: string;
   favorite?: boolean;
   createdAt?: { $gte?: Date; $lte?: Date }; // Optional range filter
   sort?: string;
   uploadedBy?: mongoose.Types.ObjectId;
};

const getAllFileAndFolder = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;

   const { favorite, date, recent, sort = "-createdAt" } = req.query;

   const filter: FileQueryFilter = {};

   if (favorite) {
      filter.favorite = favorite === "true";
   }
   if (date) {
      const startOfDay = moment(date as string)
         .startOf("day")
         .toDate();
      const endOfDay = moment(date as string)
         .endOf("day")
         .toDate();

      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
   }
   if (recent === "true") {
      const last24Hours = moment().subtract(24, "hours").toDate();
      filter.createdAt = { $gte: last24Hours };
   }

   const files = await File.find({ ...filter, uploadedBy: userId, lock: false }).sort(sort as string);
   const folders = await Folder.find({ ...filter, createdBy: userId, lock: false }).sort(sort as string);

   res.status(400).json({ files, folders });
});
const getAllLockFileAndFolder = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;
   const token = req.query.token;

   const decode = jwt.verify(token as string, config.jwt_secret as string) as JwtPayload;

   const { userId: lockUser, accessLock } = decode;

   if (userId?.toString() !== lockUser.toString()) {
      throw new AppError(403, "You are not allowed to access");
   }

   const { favorite, date, recent, sort = "-createdAt" } = req.query;

   const filter: FileQueryFilter = {};

   if (favorite) {
      filter.favorite = favorite === "true";
   }
   if (date) {
      const startOfDay = moment(date as string)
         .startOf("day")
         .toDate();
      const endOfDay = moment(date as string)
         .endOf("day")
         .toDate();

      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
   }
   if (recent === "true") {
      const last24Hours = moment().subtract(24, "hours").toDate();
      filter.createdAt = { $gte: last24Hours };
   }

   const files = await File.find({ ...filter, uploadedBy: userId, lock: true }).sort(sort as string);
   const folders = await Folder.find({ ...filter, createdBy: userId, lock: true }).sort(sort as string);

   res.status(400).json({ files, folders });
});

const getAllFileOfFolder = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;

   const { sort = "-createdAt", parentFolder } = req.query;

   const files = await File.find({ parentFolder, uploadedBy: userId, lock: false }).sort(sort as string);
   const folders = await Folder.find({ parentFolder, createdBy: userId, lock: false }).sort(sort as string);

   res.status(400).json({ files, folders });
});

const getDashboard = catchAsync(async (req, res) => {
   const userId = req.user?._id;

   const user = await User.findById(userId);

   if (!user) {
      throw new AppError(404, "User Not Found");
   }

   const files = await File.aggregate([
      {
         $match: {
            uploadedBy: user._id,
         },
      },
      {
         $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
         },
      },
   ]);

   const folders = await Folder.aggregate([
      {
         $match: {
            createdBy: user._id,
         },
      },
      {
         $group: {
            _id: null,
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
         },
      },
   ]);

   res.status(200).json({ user, files, folders });
});

const addToLockFolder = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;

   const { type } = req.body;
   const { id } = req.params;

   if (!type) {
      throw new AppError(404, "type is required");
   }

   if (type === "file") {
      const file = await File.findOneAndUpdate({ _id: id, uploadedBy: userId }, { lock: true });
      if (!file) {
         throw new AppError(404, "File not found");
      }
   } else if (type === "folder") {
      const folder = await Folder.findOneAndUpdate({ _id: id, createdBy: userId }, { lock: true });
      console.log(folder);
      if (!folder) {
         throw new AppError(404, "folder not found");
      }
   }

   res.status(400).json({ message: "Added to lock" });
});

const removeFromLockFolder = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;

   const { type } = req.body;
   const { id } = req.params;

   if (!type) {
      throw new AppError(404, "type is required");
   }

   if (type === "file") {
      const file = await File.findOneAndUpdate({ _id: id, uploadedBy: userId }, { lock: false });

      if (!file) {
         throw new AppError(404, "File not found");
      }
   } else if (type === "folder") {
      const folder = await Folder.findOneAndUpdate({ _id: id, createdBy: userId }, { lock: false });
      if (!folder) {
         throw new AppError(404, "folder not found");
      }
   }

   res.status(400).json({ message: "remove from lock" });
});

export default {
   getAllFileAndFolder,
   getAllFileOfFolder,
   getDashboard,
   getAllLockFileAndFolder,
   addToLockFolder,
   removeFromLockFolder,
};
