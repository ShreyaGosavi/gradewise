import { Response } from "express";
import { TeacherRequest } from "../../../shared/middleware/teacherAuth.middleware";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import {
    markAttendance,
    updateAttendance,
    getAttendance,
    getAttendanceSummary,
} from "../services/attendance.service";
export const markLectureAttendance = async (
    req: TeacherRequest,
    res: Response
) => {
    try {
        const { classId, subjectId, date, lectureNo, records } = req.body;

        if (!classId || !subjectId || !date || !lectureNo || !records)
            return errorResponse(res, "All fields are required", 400);

        if (!Array.isArray(records) || records.length === 0)
            return errorResponse(res, "Records must be a non-empty array", 400);

        const result = await markAttendance(
            req.teacher!.id,
            Number(classId),
            Number(subjectId),
            date,
            Number(lectureNo),
            records
        );

        return successResponse(res, result, "Attendance marked successfully", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const updateLectureAttendance = async (
    req: TeacherRequest,
    res: Response
) => {
    try {
        const { attendanceId } = req.params;
        const { records } = req.body;

        if (!records || !Array.isArray(records) || records.length === 0)
            return errorResponse(res, "Records must be a non-empty array", 400);

        const result = await updateAttendance(
            req.teacher!.id,
            Number(attendanceId),
            records
        );

        return successResponse(res, result, "Attendance updated successfully");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getLectureAttendance = async (
    req: TeacherRequest,
    res: Response
) => {
    try {
        const { classId, subjectId } = req.params;

        const result = await getAttendance(
            req.teacher!.id,
            Number(classId),
            Number(subjectId)
        );

        return successResponse(res, result, "Attendance fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};


export const getAttendanceSummaryController = async (
    req: TeacherRequest,
    res: Response
) => {
    try {
        const { classId, subjectId } = req.params;
        const result = await getAttendanceSummary(
            req.teacher!.id,
            Number(classId),
            Number(subjectId)
        );
        return successResponse(res, result, "Attendance summary fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};