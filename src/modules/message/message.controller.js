import { Router } from "express";
import * as messageService from "./message.service.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = Router();
router.post("./", messageService.sendMessage);
router.get("./", isAuth, messageService.getMessages);

export default router;
