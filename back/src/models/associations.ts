import { User } from "./user.model"
import { Photo } from "./photo.model"

// User has many Photos
User.hasMany(Photo, {
  foreignKey: "userId",
  sourceKey: "id",
})

// Photo belongs to User
Photo.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
})

