import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      if (!fs.existsSync(uploadDir)) {
         fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
   },
   filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${file.fieldname}${ext}`); // Unique filename
   },
});

// Multer upload instance (handling multiple fields)
const upload = multer({
   storage: storage,
   fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.mimetype)) {
         return cb(new Error("Only .png, .jpg, and .jpeg formats are allowed"));
      }
      cb(null, true);
   },
   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;
