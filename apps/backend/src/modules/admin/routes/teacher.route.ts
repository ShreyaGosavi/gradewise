import { Router } from "express";
import {
    createTeacher,
    getTeachers,
    getTeacher,
    removeTeacher,
} from "../controllers/teacher.controller";
import { protect } from "../../../shared/middleware/auth.middleware";

const router = Router();

// all teacher routes are protected
router.use(protect);

router.post("/", createTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.delete("/:id", removeTeacher);

export default router;