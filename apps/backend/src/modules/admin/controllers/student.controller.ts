import { Response } from "express";
import { AuthRequest } from "../../../shared/middleware/auth.middleware";
import {
    addStudent,
    getAllStudents,
    getStudentById,
    deleteStudent,
} from "../services/student.service";
import { successResponse, errorResponse } from "../../../shared/utils/apiResponse";
import { Department, Year } from "@gradewise/db";

export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, year, department } = req.body;
        if (!name || !email || !year || !department)
            return errorResponse(res, "Name, email, year and department are required", 400);

        const student = await addStudent(name, email, year, department);
        return successResponse(res, student, "Student added successfully", 201);
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { department, year, classId } = req.query;

        const students = await getAllStudents({
            department: department as Department | undefined,
            year: year as Year | undefined,
            classId: classId ? Number(classId) : undefined,
        });

        return successResponse(res, students, "Students fetched");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getStudent = async (req: AuthRequest, res: Response) => {
    try {
        const student = await getStudentById(Number(req.params.id));
        return successResponse(res, student, "Student fetched");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};

export const removeStudent = async (req: AuthRequest, res: Response) => {
    try {
        const result = await deleteStudent(Number(req.params.id));
        return successResponse(res, result, "Student deleted");
    } catch (err: any) {
        return errorResponse(res, err.message, 404);
    }
};