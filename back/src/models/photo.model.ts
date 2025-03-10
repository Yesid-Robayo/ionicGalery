import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../database/database"

// These are all the attributes in the Photo model
export interface PhotoAttributes {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

// Some attributes are optional in `Photo.build` and `Photo.create` calls
interface PhotoCreationAttributes extends Optional<PhotoAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Photo extends Model<PhotoAttributes, PhotoCreationAttributes> implements PhotoAttributes {
  public id!: number
  public filename!: string
  public originalName!: string
  public mimetype!: string
  public size!: number
  public userId!: number

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Photo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Photo",
  },
)

