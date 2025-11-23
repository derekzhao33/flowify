import express from 'express';

export interface AppError extends Error {
    status?: number;
}

export const errorHandler = (
    err: AppError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    console.error(err);
    res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    });
};