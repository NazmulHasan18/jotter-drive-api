import { Router } from "express";
import authenticate from "../middlewares/authentication";
import { changePassSchema } from "../validators/userValidators";
import validateRequest from "../middlewares/validateRequest";
import userController from "../controllers/userController";
import upload from "../middlewares/uploader";
const router = Router();
router.put(
   "/change-password",
   authenticate,
   validateRequest(changePassSchema),
   userController.changePassword
);
router.put("/logout", authenticate, userController.logout);
router.put("/update-user", authenticate, upload.single("file"), userController.updateUser);
router.delete("/delete-user", authenticate, userController.deleteUser);

const userRouter = router;
export default userRouter;
