import type { Response, NextFunction } from "express"
import { User } from "../models/user.model"
import type { AuthRequest } from "../middlewares/auth.middleware"

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user?.id

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    return res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user?.id
    const { name, email, password } = req.body

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Update user data
    if (name) user.name = name
    if (email) user.email = email
    if (password) user.password = password

    await user.save()

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    next(error)
  }
}

