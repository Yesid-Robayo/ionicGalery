import express from "express"
import { uploadPhoto, getUserPhotos, deletePhoto } from "../controllers/photo.controller"
import { authenticate } from "../middlewares/auth.middleware"
import { upload } from "../middlewares/upload.middleware"

const router = express.Router()

router.post("/upload", authenticate, upload.single("photo"), uploadPhoto)
router.get("/", authenticate, getUserPhotos)
router.delete("/:id", authenticate, deletePhoto)

export { router as photoRoutes }

