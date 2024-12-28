"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../../utils/verifyToken");
const sellerLocation_1 = require("../controller/sellerLocation");
const sellerLocationRoute = express_1.default.Router();
sellerLocationRoute.post("/create", verifyToken_1.verifySellerToken, sellerLocation_1.createLocation);
sellerLocationRoute.put("/update", verifyToken_1.verifySellerToken, sellerLocation_1.updateLocation);
sellerLocationRoute.get("/all/seller", sellerLocation_1.getAllLocationBySeller);
sellerLocationRoute.delete("/delete", verifyToken_1.verifySellerToken, sellerLocation_1.deleteLocationById);
exports.default = sellerLocationRoute;
