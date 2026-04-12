import { Router } from "express";
import { changePasswordController } from "../controllers/changePassword.controller";
import { changePasswordProtect } from "../middleware/changePassword.middleware";
import { validate } from "../middleware/validate.middleware";
import { changePasswordSchema } from "../validators/auth.validators";

const router = Router();

router.post(
    "/change-password",
    changePasswordProtect,
    validate(changePasswordSchema),
    changePasswordController
);

export default router;