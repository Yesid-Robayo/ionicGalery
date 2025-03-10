import express, { type Application } from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import path from "path"
import { authRoutes } from "./routes/auth.routes"
import { userRoutes } from "./routes/user.routes"
import { photoRoutes } from "./routes/photo.routes"
import { errorHandler } from "./middlewares/error.middleware"
import { sequelize } from "./database/database"
import "./models/associations"

const app: Application = express()

// Middlewares
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files
app.use("/api/photos", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  next()
}, express.static(path.join(__dirname, "../uploads")))


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/photos", photoRoutes)

// Error handling
app.use(errorHandler)

// Database connection and server start
const PORT = process.env.PORT || 3000

export const startServer = async (): Promise<void> => {
  try {
    await sequelize.sync()
    console.log("Database connected successfully")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}

export { app }

