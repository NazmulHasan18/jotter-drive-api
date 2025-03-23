import mongoose, { Schema, Document } from "mongoose";

export type TFile = {
   name: string;
   storedName: string;
   type: string;
   size: number;
   url: string;
   favorite: boolean;
   lock: boolean;
   uploadedBy: mongoose.Schema.Types.ObjectId;
   parentFolder?: mongoose.Schema.Types.ObjectId | null; // For drive-like hierarchy
   createdAt: Date;
};

const fileSchema = new Schema<TFile>(
   {
      name: { type: String, required: true },
      storedName: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number, required: true },
      favorite: { type: Boolean, default: false },
      lock: { type: Boolean, default: false },
      url: { type: String, required: true },
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
   },
   { timestamps: true }
);

const File = mongoose.model<TFile>("File", fileSchema);
export default File;
