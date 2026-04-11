import { Response } from "express";
import { StudentRequest } from "../../../shared/middleware/studentAuth.middleware";
import { getMyNotices } from "../services/notice.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";

export const viewNotices = async (req: StudentRequest, res: Response) => {
    try {
        const result = await getMyNotices(req.student!.id);
        return successResponse(res, result, "Notices fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};