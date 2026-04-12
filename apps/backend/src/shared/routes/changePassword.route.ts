import { Router } from "express";
import { changePasswordController } from "../controllers/changePassword.controller";
import { changePasswordProtect } from "../middleware/changePassword.middleware";

const router = Router();

router.post("/change-password", changePasswordProtect, changePasswordController);

export default router;