import { Router } from "express";
import authenticate from "../middlewares/authentication";
import validateRequest from "../middlewares/validateRequest";
import folderController from "../controllers/folderController";
import { addFolderSchema } from "../validators/folderValidators";

const router = Router();

router.post(
   "/add-folder",
   authenticate,

   validateRequest(addFolderSchema),

   folderController.createFolder
);
router.get("/folders", authenticate, folderController.getFolders);
router.patch("/favorite/:folderId", authenticate, folderController.addToFavorite);

// router.get("/copy-file/:id", authenticate, fileController.copyFile)

const folderRoutes = router;
export default folderRoutes;
