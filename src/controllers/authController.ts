import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import httpStatus from "http-status";

const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
   const { email, password } = req.body;
   const existingUser = await User.findOne({ email });
   if (existingUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
   }

   const hashedPassword = await bcrypt.hash(password, 10);
   const newUser = new User({ email, password: hashedPassword });
   await newUser.save();

   res.status(201).json({ message: "User registered successfully" });
});

const login = catchAsync(async (req: Request, res: Response) => {
   const token = jwt.sign({ id: req.user }, process.env.JWT_SECRET!, { expiresIn: "1h" });
   res.json({ token, user: req.user });
});

const googleAuthRedirect = catchAsync((req: Request, res: Response) => {
   const token = jwt.sign({ id: req.user }, process.env.JWT_SECRET!, { expiresIn: "1h" });
   res.redirect(`http://localhost:3000/dashboard?token=${token}`);
});

export default { register, login, googleAuthRedirect };
