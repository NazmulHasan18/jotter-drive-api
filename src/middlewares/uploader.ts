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
      cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
   },
});

// Multer upload instance (handling multiple fields)
const upload = multer({
   storage: storage,
   fileFilter: (req, file, cb) => {
      const allowedTypes = [
         "image/jpeg",
         "image/png",
         "image/jpg",
         "application/pdf",
         "text/plain",
         "application/msword", // .doc
         "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
         "application/vnd.ms-excel", // .xls
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      ];

      if (!allowedTypes.includes(file.mimetype)) {
         return cb(new Error("Only images, PDFs, text files, Word, and Excel files are allowed"));
      }

      cb(null, true);
   },
   limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

export default upload;
