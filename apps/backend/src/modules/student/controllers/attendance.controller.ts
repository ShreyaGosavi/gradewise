import { Response } from "express";
import { StudentRequest } from "../../../shared/middleware/studentAuth.middleware";
import { getMyAttendance } from "../services/attendance.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";

export const viewAttendance = async (req: StudentRequest, res: Response) => {
    try {
        const result = await getMyAttendance(req.student!.id);
        return successResponse(res, result, "Attendance fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};