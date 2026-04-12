import { Response } from "express";
import { TeacherRequest } from "../../../shared/middleware/teacherAuth.middleware";
import { calculateInternalMarks } from "../services/internalMarks.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";

export const calculateInternal = async (
    req: TeacherRequest,
    res: Response
) => {
    try {
        const { classId, subjectId, totalInternal, attendanceMarks } = req.body;


        if (attendanceMarks >= totalInternal)
            return errorResponse(
                res,
                "attendanceMarks must be less than totalInternal",
                400
            );

        const result = await calculateInternalMarks(
            req.teacher!.id,
            Number(classId),
            Number(subjectId),
            Number(totalInternal),
            Number(attendanceMarks)
        );

        return successResponse(res, result, "Internal marks calculated and saved");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};