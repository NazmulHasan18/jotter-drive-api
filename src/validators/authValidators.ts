import { z } from "zod";

// User Registration Validation Schema
export const registerSchema = z.object({
   username: z
      .string({
         required_error: "Username is required",
      })
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(20, { message: "Username must be at most 20 characters long" }),

   name: z
      .string({
         required_error: "Name is required",
      })
      .min(2, { message: "Name must be at least 2 characters long" })
      .optional(),

   email: z
      .string({
         required_error: "Email is required",
      })
      .email({ message: "Invalid email format" }),

   password: z
      .string({
         required_error: "Password is required",
      })
      .min(6, { message: "Password must be at least 6 characters long" }),

   age: z
      .number({
         required_error: "Age is required",
      })
      .min(18, { message: "You must be at least 18 years old" })
      .max(100, { message: "Age must be at most 100 years old" })
      .optional(),

   dob: z
      .string({
         required_error: "Date of Birth is required",
      })
      .refine((date) => !isNaN(Date.parse(date)), {
         message: "Invalid date format",
      })
      .optional(),
});

// User Login Validation Schema
export const loginSchema = z.object({
   email: z.string({ message: "email is required" }).email({ message: "Invalid email format" }),
   password: z.string({ message: "password is required" }).min(6, { message: "Invalid credentials" }),
});
export const verifySchema = z.object({
   email: z.string({ message: "email is required" }).email({ message: "Invalid email format" }),
   otp: z
      .string({ message: "password is required" })
      .min(6, { message: "Invalid credentials" })
      .max(6, { message: "Invalid credentials" }),
});
export const forgetSchema = z.object({
   email: z.string({ message: "email is required" }).email({ message: "Invalid email format" }),
});
export const changeForgetPassSchema = z.object({
   token: z.string({ message: "email is required" }),
   newPassword: z.string({ message: "password is required" }).min(6, { message: "Invalid credentials" }),
});
