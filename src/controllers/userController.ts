import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import User from "../models/User";
import AppError from "../errors/AppError";
import bcrypt from "bcryptjs";
import File from "../models/Files";
import Folder from "../models/Folder";
import fs from "fs";
import jwt from "jsonwebtoken";

const changePassword = catchAsync(async (req: Request, res: Response) => {
   const { oldPassword, newPassword } = req.body;
   const userId = req.user?._id;
   // Verify JWT token

   // Find user
   const user = await User.findById(userId);
   if (!user) {
      throw new AppError(404, "User not found");
   }

   //
   const isMatch = await bcrypt.compare(oldPassword, user.password);
   if (!isMatch) {
      throw new AppError(400, "You password not match with previous");
   }

   const hashedPassword = await bcrypt.hash(newPassword, 10);

   // Update password in DB
   user.password = hashedPassword;
   await user.save();

   res.json({ message: "Password reset successfully" });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;
   const { username } = req.body;

   const user = await User.findById(userId);

   const userImg = `/uploads/${req?.file?.filename}`;
   if (user) {
      user.userImg = userImg || user?.userImg;
      user.username = username || user?.userImg;
   }
   await user?.save();
   res.json({ message: "user update successfully" });
});

const logout = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;
   // Verify JWT token

   // Find user
   const user = await User.findById(userId);
   if (!user) {
      throw new AppError(404, "User not found");
   }

   user.loggedOut = true;
   await user.save();

   res.json({ message: "user logged out successfully" });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
   const userId = req.user?._id;

   const user = await User.findById(userId);
   if (!user) {
      throw new AppError(404, "user not found");
   }
   // Find all files uploaded by the user
   const userFiles = await File.find({ uploadedBy: userId });

   // Delete each file from local storage
   for (const file of userFiles) {
      const filePath = file.url;
      if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath); // Delete file from local storage
      }
   }

   await File.deleteMany({ uploadedBy: user._id });
   await Folder.deleteMany({ createdBy: user._id });

   await User.deleteOne({ _id: userId });

   res.json({ message: "User deleted successfully" });
});

const accessLockFolder = catchAsync(async (req: Request, res: Response) => {
   const { password } = req.body;
   const userId = req.user?._id;
   // Verify JWT token

   // Find user
   const user = await User.findById(userId);
   if (!user) {
      throw new AppError(404, "User not found");
   }

   //
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
      throw new AppError(400, "You password do not match.");
   }

   const token = jwt.sign({ userId: req.user?._id, accessLock: true }, process.env.JWT_SECRET!, {
      expiresIn: "1m",
   });

   res.json({ message: "Password verify successfully", token });
});
export default { changePassword, logout, updateUser, deleteUser, accessLockFolder };
