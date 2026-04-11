import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse";

export interface TeacherRequest extends Request {
    teacher?: { id: number; email: string };
}

export const teacherProtect = (
    req: TeacherRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return errorResponse(res, "Not authorized, no token", 401);

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { id: number; email: string };

        req.teacher = decoded;
        next();
    } catch (err) {
        return errorResponse(res, "Not authorized, invalid token", 401);
    }
};