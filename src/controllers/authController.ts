import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import httpStatus from "http-status";
import { sendForgetPassOtp } from "../utils/sendMails";
import OTP from "../models/OTP";
import config from "../config";

const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
   const { email, password, name, username, dob, age } = req.body;
   const existingUser = await User.findOne({ email });
   if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
   }

   const userImg = `/uploads/${req?.file?.filename}`;

   const hashedPassword = await bcrypt.hash(password, 10);
   const newUser = new User({ email, password: hashedPassword, name, username, dob, age, userImg });
   await newUser.save();

   res.status(201).json({ message: "User registered successfully" });
});

const login = catchAsync(async (req: Request, res: Response) => {
   const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET!, { expiresIn: "1h" });
   res.json({ token, user: req.user });
});

const googleAuthRedirect = catchAsync((req: Request, res: Response) => {
   const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET!, { expiresIn: "1h" });
   res.redirect(`http://localhost:3000/dashboard?token=${token}`);
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
   const { email } = req.body;
   const user = await User.findOne({ email });
   if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
   }

   if (user.googleId) {
      throw new AppError(httpStatus.BAD_REQUEST, "User registered with google account");
   }

   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   await sendForgetPassOtp({ email, otp, name: user.name || "user" });

   await OTP.create({ email, otp });

   res.status(httpStatus.OK).json({ message: "OTP sent to your email" });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
   const { email, otp } = req.body;
   const user = await User.findOne({ email });
   if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
   }

   const record = await OTP.findOne({ email, otp });

   if (!record) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid Otp");
   }

   // OTP is valid, delete it after verification
   await OTP.deleteOne({ _id: record._id });

   const resetToken = jwt.sign({ email }, config.jwt_secret as string, { expiresIn: "10m" });

   res.status(httpStatus.OK).json({ message: "OTP sent to your email", resetToken });
});

const changeForgetPassword = catchAsync(async (req: Request, res: Response) => {
   const { token, newPassword } = req.body;
   if (!token || !newPassword) {
      throw new AppError(400, "Token and new password are required");
   }
   // Verify JWT token
   let decoded;
   try {
      decoded = jwt.verify(token, config.jwt_secret as string);
   } catch (err) {
      throw new AppError(400, "Invalid or expired token");
   }

   // Find user
   const user = await User.findOne({ email: (decoded as any).email });
   if (!user) {
      throw new AppError(404, "User not found");
   }

   // Hash the new password
   const hashedPassword = await bcrypt.hash(newPassword, 10);

   // Update password in DB
   user.password = hashedPassword;
   await user.save();

   res.json({ message: "Password reset successfully" });
});

export default {
   register,
   login,
   googleAuthRedirect,
   forgetPassword,
   verifyOtp,
   changeForgetPassword,
};
