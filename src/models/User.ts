import mongoose from "mongoose";

export type TUser = {
   email: string;
   name: string;
   userImg: string;
   password?: string;
   googleId?: string;
};

const UserSchema = new mongoose.Schema<TUser>({
   email: { type: String, required: true, unique: true },
   name: { type: String },
   userImg: { type: String },
   password: { type: String },
   googleId: { type: String },
});

export default mongoose.model<TUser>("User", UserSchema);
