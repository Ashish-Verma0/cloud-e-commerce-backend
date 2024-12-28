"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const verifyToken_1 = require("../../utils/verifyToken");
const product_1 = require("../controller/product.");
const productRoute = express_1.default.Router();
const imageUpload = (0, multer_1.default)({
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    storage: multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path_1.default.resolve(__dirname, "../../public/product"));
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
const excelUpload = (0, multer_1.default)({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    storage: multer_1.default.memoryStorage(), // Use memoryStorage
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(xls|xlsx)$/i)) {
            return cb(new Error("Please upload a valid Excel file (xls or xlsx)"));
        }
        cb(null, true);
    },
});
productRoute.post("/bulk/create", excelUpload.single("excel"), verifyToken_1.verifySellerToken, product_1.createBulkProduct);
productRoute.post("/create", imageUpload.array("productimage", 10), verifyToken_1.verifySellerToken, product_1.createProduct);
productRoute.put("/update", imageUpload.array("productimage", 10), verifyToken_1.verifySellerToken, product_1.updateProduct);
productRoute.get("/all", product_1.getAllProducts);
productRoute.get("/search", product_1.searchProducts);
productRoute.get("/all/seller", verifyToken_1.verifySellerToken, product_1.getAllProductsBySeller);
productRoute.get("/all/out-stock", verifyToken_1.verifySellerToken, product_1.sellerOutOfStockProduct);
productRoute.get("/productDetail", product_1.getProductById);
productRoute.delete("/delete", verifyToken_1.verifySellerToken, product_1.deleteProduct);
exports.default = productRoute;
