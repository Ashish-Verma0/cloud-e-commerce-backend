import multer from "multer";
import express from "express";
import path from "path";
import { verifySellerToken } from "../../utils/verifyToken";
import {
  createSubcategory,
  getAllSubCategory,
} from "../controller/subCategory";

const subcategoryRoute = express.Router();

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

subcategoryRoute.post(
  "/create",
  imageUpload.single("subcategoryLogo"),
  verifySellerToken,
  createSubcategory
);
subcategoryRoute.get(
  "/all",

  getAllSubCategory
);

export default subcategoryRoute;
