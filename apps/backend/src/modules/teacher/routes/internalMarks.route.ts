import { Router } from "express";
import { calculateInternal } from "../controllers/internalMarks.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";

const router = Router();

router.use(teacherProtect);

router.post("/calculate", calculateInternal);

export default router;