import mongoose from "mongoose";
export type TUser = {
   username: string;
   name?: string;
   email: string;
   password: string;
   age?: number;
   dob?: Date;
   userImg?: string;
   googleId?: string;
};

const UserSchema = new mongoose.Schema<TUser>({
   username: {
      type: String,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [20, "Username must be at most 20 characters long"],
      unique: true,
   },
   name: {
      type: String,
      minlength: [2, "Name must be at least 2 characters long"],
   },
   email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
   },
   password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
   },
   age: {
      type: Number,
      min: [18, "You must be at least 18 years old"],
      max: [100, "Age must be at most 100 years old"],
   },
   dob: {
      type: Date,
   },
   userImg: {
      type: String,
      default: "",
   },
   googleId: {
      type: String,
      default: "",
   },
});

const User = mongoose.model<TUser>("User", UserSchema);

export default User;
