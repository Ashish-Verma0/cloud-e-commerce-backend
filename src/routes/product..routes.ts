import multer from "multer";
import express from "express";
import path from "path";
import { verifySellerToken } from "../../utils/verifyToken";
import {
  createBulkProduct,
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllProductsBySeller,
  getProductById,
  searchProducts,
  sellerOutOfStockProduct,
  updateProduct,
} from "../controller/product.";

const productRoute = express.Router();

const imageUpload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, "../../public/product"));
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

const excelUpload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  storage: multer.memoryStorage(), // Use memoryStorage
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(xls|xlsx)$/i)) {
      return cb(new Error("Please upload a valid Excel file (xls or xlsx)"));
    }
    cb(null, true);
  },
});

productRoute.post(
  "/bulk/create",
  excelUpload.single("excel"),
  verifySellerToken,
  createBulkProduct
);

productRoute.post(
  "/create",
  imageUpload.array("productimage", 10),
  verifySellerToken,
  createProduct
);

productRoute.put(
  "/update",
  imageUpload.array("productimage", 10),
  verifySellerToken,
  updateProduct
);
productRoute.get("/all", getAllProducts);
productRoute.get("/search", searchProducts);
productRoute.get("/all/seller", verifySellerToken, getAllProductsBySeller);
productRoute.get("/all/out-stock", verifySellerToken, sellerOutOfStockProduct);
productRoute.get("/productDetail", getProductById);
productRoute.delete("/delete", verifySellerToken, deleteProduct);

export default productRoute;
