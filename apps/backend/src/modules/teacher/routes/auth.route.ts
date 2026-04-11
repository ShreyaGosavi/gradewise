import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", teacherProtect, getMe);

export default router;