import { verifyToken } from "../../utils/verifyToken";
import express from "express";
import {
  createUser,
  forgotPassword,
  loginUser,
  updatePassword,
  userById,
  userProfile,
  userUpdate,
  verifyEmail,
} from "../controller/user";
import multer from "multer";
import path from "path";
const userRoute = express.Router();

const imageUpload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, "../../public/userImage"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  }),
  fileFilter: function (req, file, cb) {
    if (
      !file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i)
    ) {
      return cb(new Error("Please upload a valid image file (e.g., jpg, png)"));
    }
    cb(null, true);
  },
});
userRoute.post("/create", imageUpload.single("avatar"), createUser);
userRoute.post("/login", loginUser);
userRoute.get("/profile", verifyToken, userProfile);
userRoute.get("/user/:id", verifyToken, userById);
userRoute.get("/update-user", verifyToken, userUpdate);
userRoute.get("/update-password", verifyToken, updatePassword);
userRoute.post("/verify-email", verifyEmail);
userRoute.post("/forgot-password", forgotPassword);

export default userRoute;
