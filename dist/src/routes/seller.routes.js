"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const seller_1 = require("../controller/seller");
const path_1 = __importDefault(require("path"));
const verifyToken_1 = require("../../utils/verifyToken");
const sellerRoute = express_1.default.Router();
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
sellerRoute.post("/create", imageUpload.single("shopLogo"), seller_1.createSeller);
sellerRoute.post("/login", seller_1.loginSeller);
sellerRoute.get("/profile", verifyToken_1.verifySellerToken, seller_1.sellerProfile);
sellerRoute.post("/verify-email", verifyToken_1.verifySellerToken, seller_1.verifySellerEmail);
sellerRoute.post("/verify-otp", verifyToken_1.verifySellerToken, seller_1.verifySellerOtp);
exports.default = sellerRoute;
