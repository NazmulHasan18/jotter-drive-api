import mongoose from "mongoose";
import { z } from "zod";

export const addFolderSchema = z.object({
   name: z.string({ message: "Invalid type" }),
   parentFolder: z
      .string()
      .optional()
      .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), { message: "Invalid ObjectId" }),
});
