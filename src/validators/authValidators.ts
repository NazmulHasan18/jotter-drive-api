import { z } from "zod";

// User Registration Validation Schema
export const registerSchema = z.object({
   email: z
      .string({
         required_error: "email is required",
      })
      .email({ message: "Invalid email format" }),
   password: z
      .string({
         required_error: "Password is required",
      })
      .min(6, { message: "Password must be at least 6 characters long" }),
});

// User Login Validation Schema
export const loginSchema = z.object({
   email: z.string().email({ message: "Invalid email format" }),
   password: z.string().min(6, { message: "Invalid credentials" }),
});
