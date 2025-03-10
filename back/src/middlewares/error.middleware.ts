import type { Request, Response, NextFunction } from "express"

interface AppError extends Error {
  statusCode?: number
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack)

  const statusCode = err.statusCode || 500
  const message = err.message || "Error interno del servidor"

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  })
}

