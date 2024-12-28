"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../../utils/verifyToken");
const order_1 = require("../controller/order");
const orderRoute = express_1.default.Router();
orderRoute.post("/create", verifyToken_1.verifyToken, order_1.createOrder);
orderRoute.put("/update", verifyToken_1.verifySellerToken, order_1.updateOrder);
orderRoute.get("/all/seller", verifyToken_1.verifySellerToken, order_1.getOrdersBySeller);
orderRoute.get("/all/user", verifyToken_1.verifyToken, order_1.getOrdersByUser);
orderRoute.get("/id", verifyToken_1.verifyToken, order_1.getOrderById);
orderRoute.delete("/delete", verifyToken_1.verifySellerToken, order_1.deleteOrder);
exports.default = orderRoute;
