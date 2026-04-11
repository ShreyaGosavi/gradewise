import { Router } from "express";
import { viewNotices } from "../controllers/notice.controller";
import { studentProtect } from "../../../shared/middleware/studentAuth.middleware";

const router = Router();

router.use(studentProtect);
router.get("/", viewNotices);

export default router;