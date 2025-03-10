import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model"

export interface UserPayload {
  id: number
  email: string
}

export interface AuthRequest extends Request {
  user?: UserPayload
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autorizado" })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SecretYesidGalery") as UserPayload

    // Find user
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(401).json({ message: "No autorizado" })
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: "No autorizado" })
  }
}

