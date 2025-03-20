import express from "express";
import passport from "passport";
import authController from "../controllers/authController";
import validateRequest from "../middlewares/validateRequest";
import { registerSchema } from "../validators/authValidators";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", passport.authenticate("local", { session: false }), authController.login);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
   "/google/callback",
   passport.authenticate("google", { session: false }),
   authController.googleAuthRedirect
);

export default router;
