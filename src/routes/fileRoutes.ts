import { Router } from "express";
import fileController from "../controllers/fileController";
import fileupload from "../middlewares/fileUploader";
import authenticate from "../middlewares/authentication";
import checkStorage from "../middlewares/checkStorage";
import validateRequest from "../middlewares/validateRequest";
import { addFileSchema } from "../validators/fileValidators";

const router = Router();

router.post(
   "/add-files",
   authenticate,
   fileupload.array("files", 15),
   validateRequest(addFileSchema),
   checkStorage,
   fileController.createFile
);
router.get("/get-files", authenticate, fileController.getFiles);
router.patch("/favorite/:fileId", authenticate, fileController.addToFavorite);
router.post("/copy-file", authenticate, fileController.copyFile);
router.patch("/rename", authenticate, fileController.renameFile);
router.delete("/delete/files/:fileId", authenticate, fileController.deleteFile);

const fileRoutes = router;
export default fileRoutes;
