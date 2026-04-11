import { Router } from "express";
import { viewMarks } from "../controllers/marks.controller";
import { studentProtect } from "../../../shared/middleware/studentAuth.middleware";

const router = Router();

router.use(studentProtect);
router.get("/", viewMarks);

export default router;