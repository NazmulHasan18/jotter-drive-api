import mongoose, { Schema, Document } from "mongoose";

export type TFolder = {
   name: string;
   createdBy: mongoose.Schema.Types.ObjectId;
   parentFolder?: mongoose.Schema.Types.ObjectId | null; // Nullable for root folders
   createdAt: Date;
   favorite: boolean;
   lock: boolean;
   size: number;
};

const folderSchema = new Schema<TFolder>(
   {
      name: { type: String, required: true, trim: true },
      createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
      size: { type: Number, default: 0 },
      favorite: { type: Boolean, default: false },
      lock: { type: Boolean, default: false },
   },
   { timestamps: true }
);

const Folder = mongoose.model<TFolder>("Folder", folderSchema);
export default Folder;
