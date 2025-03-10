import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

export const sequelize = new Sequelize(
  process.env.DB_NAME || "photo_gallery",
  process.env.DB_USER || "yesid",
  process.env.DB_PASSWORD || "1234",
  {
    host: process.env.DB_HOST || "photo-gallery-db",
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
)

