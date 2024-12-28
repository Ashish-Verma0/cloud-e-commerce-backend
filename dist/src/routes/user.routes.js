"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifyToken_1 = require("../../utils/verifyToken");
const express_1 = __importDefault(require("express"));
const user_1 = require("../controller/user");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const userRoute = express_1.default.Router();
const imageUpload = (0, multer_1.default)({
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.resolve(__dirname, "../../public/userImage"));
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "_" + file.originalname);
        },
    }),
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff|webp|svg)$/i)) {
            return cb(new Error("Please upload a valid image file (e.g., jpg, png)"));
        }
        cb(null, true);
    },
});
userRoute.post("/create", imageUpload.single("avatar"), user_1.createUser);
userRoute.post("/login", user_1.loginUser);
userRoute.get("/profile", verifyToken_1.verifyToken, user_1.userProfile);
userRoute.get("/user/:id", verifyToken_1.verifyToken, user_1.userById);
userRoute.put("/update-user", verifyToken_1.verifyToken, user_1.userUpdate);
userRoute.put("/update-password", verifyToken_1.verifyToken, user_1.updatePassword);
userRoute.post("/verify-email", user_1.verifyEmail);
userRoute.post("/forgot-password", user_1.forgotPassword);
exports.default = userRoute;
