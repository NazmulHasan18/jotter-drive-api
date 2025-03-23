import { z } from "zod";

export const changePassSchema = z.object({
   newPassword: z.string({ message: "new password is required" }).min(6, { message: "Invalid credentials" }),
   oldPassword: z.string({ message: "old password is required" }).min(6, { message: "Invalid credentials" }),
});
