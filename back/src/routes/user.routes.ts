import express from "express"
import { getProfile, updateProfile } from "../controllers/user.controller"
import { authenticate } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/profile", authenticate, getProfile)
router.put("/profile", authenticate, updateProfile)

export { router as userRoutes }

