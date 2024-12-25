import express from "express";

import { verifySellerToken } from "../../utils/verifyToken";
import {
  createLocation,
  deleteLocationById,
  getAllLocationBySeller,
  updateLocation,
} from "../controller/sellerLocation";

const sellerLocationRoute = express.Router();

sellerLocationRoute.post("/create", verifySellerToken, createLocation);
sellerLocationRoute.put("/update", verifySellerToken, updateLocation);
sellerLocationRoute.get("/all/seller", getAllLocationBySeller);
sellerLocationRoute.delete("/delete", verifySellerToken, deleteLocationById);

export default sellerLocationRoute;
