import mongoose from "mongoose";
import { z } from "zod";

export const addFileSchema = z.object({
   type: z.enum(["notes", "pdfs", "images"], { message: "Invalid type" }),
   parentFolder: z
      .string()
      .optional()
      .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), { message: "Invalid ObjectId" }),
});
