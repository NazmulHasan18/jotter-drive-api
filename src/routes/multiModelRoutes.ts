import { Router } from "express";
import authenticate from "../middlewares/authentication";
import multiModelController from "../controllers/multiModelController";

const router = Router();

router.get("/get-file-folder", authenticate, multiModelController.getAllFileAndFolder);
router.get("/get-file-of-folder", authenticate, multiModelController.getAllFileOfFolder);
router.get("/dashboard", authenticate, multiModelController.getDashboard);

const multiModelRoute = router;
export default multiModelRoute;
