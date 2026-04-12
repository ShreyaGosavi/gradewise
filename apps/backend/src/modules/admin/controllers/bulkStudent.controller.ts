import { Response } from "express";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";
import { bulkAddStudents } from "../services/bulkStudent.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";

export const bulkCreateStudents = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file)
            return errorResponse(res, "CSV file is required", 400);

        const result = await bulkAddStudents(req.file.buffer);
        return successResponse(res, result, "Bulk student upload processed", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};