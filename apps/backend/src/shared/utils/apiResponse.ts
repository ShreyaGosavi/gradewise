import { Response } from "express";

export const successResponse = (
    res: Response,
    data: any,
    message: string = "Success",
    statusCode: number = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const paginatedResponse = (
    res: Response,
    data: any,
    total: number,
    page: number,
    limit: number,
    message: string = "Success"
) => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        message,
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    });
};

export const errorResponse = (
    res: Response,
    message: string = "Something went wrong",
    statusCode: number = 500
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
    });
};