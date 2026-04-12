import { Response } from "express";
import { TeacherRequest } from "../../../shared/middleware/teacherAuth.middleware";
import {
    createNotice,
    getNotices,
    deleteNotice,
} from "../services/notice.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { NoticeType } from "@gradewise/db";

export const postNotice = async (req: TeacherRequest, res: Response) => {
    try {
        const { classId, title, content, type, dueDate } = req.body;

        const result = await createNotice(
            req.teacher!.id,
            Number(classId),
            title,
            content,
            type as NoticeType,
            dueDate
        );

        return successResponse(res, result, "Notice posted successfully", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const viewNotices = async (req: TeacherRequest, res: Response) => {
    try {
        const { classId } = req.params;

        const result = await getNotices(
            req.teacher!.id,
            Number(classId)
        );

        return successResponse(res, result, "Notices fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const removeNotice = async (req: TeacherRequest, res: Response) => {
    try {
        const { noticeId } = req.params;

        const result = await deleteNotice(
            req.teacher!.id,
            Number(noticeId)
        );

        return successResponse(res, result, "Notice deleted");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};