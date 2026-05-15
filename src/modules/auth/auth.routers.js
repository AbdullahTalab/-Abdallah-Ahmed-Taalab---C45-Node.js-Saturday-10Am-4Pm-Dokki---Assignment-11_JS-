import { Router } from "express";
import * as authController from "./auth.controller.js";
import { upload } from "../../utils/multer.js";
import { validation } from "../../middleware/validation/validation.middleware.js";
import { signupSchema } from "./auth.validation.js";

const router = Router();
router.post(
  "/signup",
  upload.single("profilePic"),
  validation(signupSchema),
  authController.signup,
);

router.post(
  "/verify",
  authController.verifyOTP
);

router.post(
  "/resend-otp",
  authController.resendOtp
);

router.post(
  "/login",
  authController.login
);

export default router;
