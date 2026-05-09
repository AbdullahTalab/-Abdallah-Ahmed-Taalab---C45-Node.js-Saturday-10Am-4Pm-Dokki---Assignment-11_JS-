import { Router } from "express";
import * as userController from "./user.controller.js";

const userRouter = Router();

userRouter.get("/:id", userController.getProfile);

export { userRouter };