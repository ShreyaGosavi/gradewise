import { Router } from "express";
import {
    postNotice,
    viewNotices,
    removeNotice,
} from "../controllers/notice.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";

const router = Router();

router.use(teacherProtect);

router.post("/", postNotice);
router.get("/:classId", viewNotices);
router.delete("/:noticeId", removeNotice);

export default router;