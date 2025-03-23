import multer from "multer";
import AppError from "../errors/AppError";

const storage = multer.memoryStorage(); // Store files in memory, NOT disk

const fileupload = multer({
   storage,
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
         return cb(new AppError(400, "Only images, PDFs, text files, Word, and Excel files are allowed"));
      }

      cb(null, true);
   },
   limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

export default fileupload;
