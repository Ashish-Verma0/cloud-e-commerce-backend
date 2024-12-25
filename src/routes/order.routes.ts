import express from "express";

import { verifySellerToken, verifyToken } from "../../utils/verifyToken";

import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrdersBySeller,
  getOrdersByUser,
  updateOrder,
} from "../controller/order";

const orderRoute = express.Router();

orderRoute.post("/create", verifyToken, createOrder);
orderRoute.put("/update", verifySellerToken, updateOrder);
orderRoute.get("/all/seller", verifySellerToken, getOrdersBySeller);
orderRoute.get("/all/user", verifyToken, getOrdersByUser);
orderRoute.get("/id", verifySellerToken, getOrderById);
orderRoute.delete("/delete", verifySellerToken, deleteOrder);

export default orderRoute;
