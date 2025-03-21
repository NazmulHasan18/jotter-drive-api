import mongoose, { Document } from "mongoose";

// Define the OTP Schema Type
export type TOTP = {
   email: string;
   otp: string;
   createdAt: Date;
};

// Create OTP Schema
const otpSchema = new mongoose.Schema<TOTP>(
   {
      email: {
         type: String,
         required: true,
         trim: true,
         lowercase: true,
         validate: {
            validator: (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
            message: "Invalid email format",
         },
      },
      otp: {
         type: String,
         required: true,
         validate: {
            validator: (otp: string) => /^\d{6}$/.test(otp),
            message: "OTP must be a 6-digit number",
         },
      },
      createdAt: {
         type: Date,
         default: Date.now,
         expires: 120,
      },
   },
   { timestamps: true }
);

// Create OTP Model
const OTP = mongoose.model<TOTP>("OTP", otpSchema);

export default OTP;
