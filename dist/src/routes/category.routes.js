"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const verifyToken_1 = require("../../utils/verifyToken");
const category_1 = require("../controller/category");
const categoryRoute = express_1.default.Router();
const imageUpload = (0, multer_1.default)({
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.resolve(__dirname, "../../public/category"));
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
categoryRoute.get("/all", category_1.getAllCategory);
categoryRoute.post("/create", imageUpload.single("categoryLogo"), verifyToken_1.verifySellerToken, category_1.createCategory);
categoryRoute.put("/update", imageUpload.single("categoryLogo"), verifyToken_1.verifySellerToken, category_1.updateCategory);
categoryRoute.delete("/delete", verifyToken_1.verifySellerToken, category_1.deleteCategory);
exports.default = categoryRoute;
