import fs, { rename } from "fs";
import path from "path";
import { Request, Response } from "express";
import User from "../models/User";
import AppError from "../errors/AppError";
import File from "../models/Files";
import catchAsync from "../utils/catchAsync";
import mongoose from "mongoose";
import Folder from "../models/Folder";

const uploadDir = path.join(__dirname, "../uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

const createFile = catchAsync(async (req: Request, res: Response) => {
   const { type, parentFolder } = req.body;

   const userId = req.user?._id;
   if (!userId) {
      throw new AppError(401, "User authentication required");
   }

   const user = await User.findById(userId);
   if (!user) new AppError(404, "User not found");

   if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError(400, "No files uploaded");
   }

   const uploadedFiles = [];
   for (const file of req.files) {
      const storedName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, storedName);
      fs.writeFileSync(filePath, file.buffer);

      const newFile = await File.create({
         uploadedBy: userId,
         name: file.originalname,
         storedName,
         parentFolder,
         type,
         size: file.size,
         url: filePath,
      });

      uploadedFiles.push(newFile);
   }

   const totalUploadSize = req.files.reduce((acc, file) => acc + file.size, 0);
   if (user) {
      user.usedStorage = user?.usedStorage || 0 + totalUploadSize;
      await user.save();
   }
   if (parentFolder) {
      const parent = await Folder.findById(parentFolder);
      if (parent) {
         parent.size += totalUploadSize;
      }
      await parent?.save();
   }

   res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      files: uploadedFiles,
   });
});

type FileQueryFilter = {
   type?: string;
   favorite?: boolean;
   lock?: boolean;
   createdAt?: { $gte?: Date; $lte?: Date }; // Optional range filter
   sort?: string;
   uploadedBy?: mongoose.Types.ObjectId;
};

const getFiles = catchAsync(async (req, res) => {
   const userId = req.user?._id;
   const { type, sort = "-createdAt" } = req.query;

   const filter: FileQueryFilter = { uploadedBy: userId, lock: false };

   if (type && ["images", "notes", "pdfs"].includes(type as string)) {
      filter.type = type as string;
   }
   if (type && !["images", "notes", "pdfs"].includes(type as string)) {
      throw new AppError(400, "Invalid type");
   }

   const files = await File.find(filter).sort(sort as string);

   res.status(200).json({ files });
});
const copyFile = catchAsync(async (req: Request, res: Response) => {
   const { fileId, targetFolderId } = req.body;
   const userId = req.user?._id; // Assuming authentication middleware sets `req.user`

   const user = req.user;

   // Find the original file
   const originalFile = await File.findOne({ _id: fileId, uploadedBy: userId });
   if (!originalFile) {
      throw new AppError(404, "File not found");
   }

   if ((user?.usedStorage || 0) + originalFile?.size > (user?.totalStorage || 0)) {
      throw new AppError(400, "Not enough storage");
   }

   // Check if target folder exists
   const targetFolder = await Folder.findOne({ _id: targetFolderId, createdBy: userId });

   // Define the new file path (if stored locally)
   const uploadsDir = path.join(__dirname, "../uploads");
   const oldFilePath = path.join(uploadsDir, originalFile.storedName);
   const newFileName = `copy-${Date.now()}-${originalFile.storedName}`;
   const newFilePath = path.join(uploadsDir, newFileName);

   // Copy the file on disk
   fs.copyFileSync(oldFilePath, newFilePath);

   // Create a new file entry in the database
   const newFile = new File({
      uploadedBy: originalFile.uploadedBy, // Keep the same owner
      storedName: newFileName,
      name: `copy-${originalFile.name}`,
      url: newFilePath, // Add "Copy of" to the name
      type: originalFile.type,
      size: originalFile.size,
      createdAt: new Date(), // Set new creation time
      parentFolder: targetFolder?._id,
   });

   if (targetFolder) {
      targetFolder.size += newFile.size;
      await targetFolder.save();
   }

   await newFile.save(); // Save to DB

   // Return the new file details
   res.status(201).json({
      success: true,
      message: "File copied successfully",
      data: newFile,
   });
});

const renameFile = catchAsync(async (req: Request, res: Response) => {
   const { fileId, newName } = req.body;
   const userId = req.user?._id; // Assuming authentication middleware sets `req.user`

   // Find the file
   const file = await File.findOne({ _id: fileId, uploadedBy: userId });
   if (!file) {
      throw new AppError(404, "File not found");
   }

   // Define old and new file paths
   const uploadsDir = path.join(__dirname, "../uploads");
   const oldFilePath = file.url;
   const fileExtension = path.extname(file.storedName);
   const newStoredName = `${Date.now()}-${newName}${fileExtension}`;
   const newFilePath = path.join(uploadsDir, newStoredName);

   // Rename file in the file system
   fs.renameSync(oldFilePath, newFilePath);

   // Update file details in the database
   file.storedName = newStoredName;
   file.name = newName + fileExtension;
   file.url = newFilePath; // Update URL if needed
   await file.save();

   // Return the updated file details
   res.status(200).json({
      success: true,
      message: "File renamed successfully",
      data: file,
   });
});

const deleteFile = catchAsync(async (req: Request, res: Response) => {
   const { fileId } = req.params;
   const userId = req.user?._id;

   // 1. Validate input
   if (!fileId) {
      throw new AppError(400, "File ID is required");
   }

   // 2. Find the file in database
   const file = await File.findOne({ _id: fileId, uploadedBy: userId });
   if (!file) {
      throw new AppError(404, "File not found or unauthorized");
   }

   const filePath = file.url;

   // 4. Check if file exists in filesystem
   fs.access(filePath, (error) => new AppError(400, error?.message as string));

   // 5. Delete the file
   fs.unlink(filePath, (error) => new AppError(400, error?.message as string));
   if (file.parentFolder) {
      await Folder.findByIdAndUpdate(file.parentFolder, { $inc: { size: -file.size } });
   }

   // 6. Delete file record from database
   await File.findByIdAndDelete(fileId);

   // 7. Update user's storage usage
   await User.findByIdAndUpdate(
      userId,
      {
         $inc: { usedStorage: -file.size },
      },
      { new: true }
   );

   res.status(200).json({
      success: true,
      message: "File deleted successfully",
      data: null,
   });
});

const addToFavorite = catchAsync(async (req: Request, res: Response) => {
   const { fileId } = req.params;
   const userId = req.user?._id;

   // 1. Validate input
   if (!fileId) {
      throw new AppError(400, "File ID is required");
   }

   // 2. Find the file in database
   const file = await File.findOne({ _id: fileId, uploadedBy: userId });
   if (!file) {
      throw new AppError(404, "File not found or unauthorized");
   }

   file.favorite = !file.favorite;
   await file.save();

   res.status(200).json({
      success: true,
      message: `File ${file.favorite ? "added to favorites" : "removed from favorites"}`,
      data: file,
   });
});

export default { createFile, getFiles, copyFile, renameFile, deleteFile, addToFavorite };
