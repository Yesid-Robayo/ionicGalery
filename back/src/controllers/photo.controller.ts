import type { Response, NextFunction } from "express"
import fs from "fs"
import path from "path"
import { Photo } from "../models/photo.model"
import type { AuthRequest } from "../middlewares/auth.middleware"

const uploadsDir = path.join(__dirname, "../../uploads")

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export const uploadPhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ninguna imagen" })
    }

    const { filename, originalname, mimetype, size } = req.file
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" })
    }

    const photo = await Photo.create({
      filename,
      originalName: originalname,
      mimetype,
      size,
      userId,
    })

    return res.status(201).json({
      id: photo.id,
      filename,
      originalName: originalname,
      mimetype,
      size,
    })
  } catch (error) {
    next(error)
  }
}

export const getUserPhotos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" })
    }

    const photos = await Photo.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    })

    return res.status(200).json(photos)
  } catch (error) {
    next(error)
  }
}

export const deletePhoto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" })
    }

    const photo = await Photo.findOne({
      where: { id, userId },
    })

    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" })
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, photo.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete from database
    await photo.destroy()

    return res.status(200).json({ message: "Foto eliminada correctamente" })
  } catch (error) {
    next(error)
  }
}

