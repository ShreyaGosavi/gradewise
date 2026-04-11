import { Response } from "express";
import { StudentRequest } from "../../../shared/middleware/studentAuth.middleware";
import { getMyMarks } from "../services/marks.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";

export const viewMarks = async (req: StudentRequest, res: Response) => {
    try {
        const result = await getMyMarks(req.student!.id);
        return successResponse(res, result, "Marks fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};