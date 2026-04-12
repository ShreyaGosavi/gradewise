import { Router } from "express";
import {
    postNotice,
    viewNotices,
    removeNotice,
} from "../controllers/notice.controller";
import { teacherProtect } from "../../../shared/middleware/teacherAuth.middleware";
import { validate } from "../../../shared/middleware/validate.middleware";
import { postNoticeSchema } from "../../../shared/validators/teacher.validators";

const router = Router();

router.use(teacherProtect);

router.post("/", validate(postNoticeSchema), postNotice);
router.get("/:classId", viewNotices);
router.delete("/:noticeId", removeNotice);

export default router;