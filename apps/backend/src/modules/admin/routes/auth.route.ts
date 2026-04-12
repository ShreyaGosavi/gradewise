import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { loginSchema } from "../../../shared/validators/admin.validators";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;