import { Request, Response } from "express";
import Folder from "../models/Folder";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";

const createFolder = catchAsync(async (req: Request, res: Response) => {
   const { name, parentFolder } = req.body;
   const userId = req.user?._id; // Assuming user is authenticated

   if (!name) {
      throw new AppError(400, "Folder name is required");
   }

   // Check if folder already exists in the given parent directory
   const existingFolder = await Folder.findOne({ name, createdBy: userId, parentFolder });
   if (existingFolder) {
      throw new AppError(400, " Folder with this name already exists");
   }

   // Create folder entry in MongoDB
   const newFolder = new Folder({ name, createdBy: userId, parentFolder });
   await newFolder.save();

   res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: newFolder,
   });
});

const getFolders = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;
   const { sort = "-createdAt" } = req.query;

   const files = await Folder.find({ createdBy: userId }).sort(sort as string);

   res.status(200).json({ files });
});

const addToFavorite = catchAsync(async (req: Request, res: Response) => {
   const { folderId } = req.params;
   const userId = req.user?._id;

   // 1. Validate input
   if (!folderId) {
      throw new AppError(400, "Folder ID is required");
   }

   // 2. Find the file in database
   const folder = await Folder.findOne({ _id: folderId, createdBy: userId });
   if (!folder) {
      throw new AppError(404, "folder not found or unauthorized");
   }

   folder.favorite = !folder.favorite;
   await folder.save();

   res.status(200).json({
      success: true,
      message: `folder ${folder.favorite ? "added to favorites" : "removed from favorites"}`,
      data: folder,
   });
});

export default { createFolder, getFolders, addToFavorite };
