import { Router } from "express";
import { signUp } from "../modules/auth/auth.controller.js";
import * as userController from "../modules/user/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";

const router = Router();


router.post(
    "/signup",
    upload.single("profilePic"),
    signUp
);

router.get("/profile/:id", userController.getProfile);

router.patch(
    "/cover-pictures",
    auth,
    upload.array("coverPictures", 2),
    userController.uploadCoverPictures
);

router.patch(
    "/profile-pic",
    auth,
    upload.single("profilePic"),
    userController.updateProfilePic
);

router.delete(
    "/profile-pic",
    auth,
    userController.deleteProfilePic
);

router.get(
    "/visit-count/:id",
    auth,
    userController.getVisitCount
);


export default router;
