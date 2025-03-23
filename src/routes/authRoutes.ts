import express from "express";
import passport from "passport";
import authController from "../controllers/authController";
import validateRequest from "../middlewares/validateRequest";
import {
   changeForgetPassSchema,
   forgetSchema,
   loginSchema,
   registerSchema,
   verifySchema,
} from "../validators/authValidators";
import upload from "../middlewares/uploader";
import dataParser from "../middlewares/dataParser";

const router = express.Router();

router.post(
   "/register",
   upload.single("userImg"),
   dataParser,
   validateRequest(registerSchema),
   authController.register
);
router.post(
   "/login",
   validateRequest(loginSchema),
   passport.authenticate("local", { session: false }),
   authController.login
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
   "/google/callback",
   passport.authenticate("google", { session: false }),
   authController.googleAuthRedirect
);
router.post("/forget-password", validateRequest(forgetSchema), authController.forgetPassword);
router.post("/verify-password", validateRequest(verifySchema), authController.verifyOtp);
router.put(
   "/change-forget-password",
   validateRequest(changeForgetPassSchema),
   authController.changeForgetPassword
);

export default router;
