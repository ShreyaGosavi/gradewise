import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { studentProtect } from "../../../shared/middleware/studentAuth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", studentProtect, getMe);

export default router;