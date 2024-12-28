"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const verifyToken_1 = require("../../utils/verifyToken");
const express_1 = __importDefault(require("express"));
const userLocation_1 = require("../controller/userLocation");
const userLocationRoute = express_1.default.Router();
userLocationRoute.post("/create", verifyToken_1.verifyToken, userLocation_1.createUserLocation);
userLocationRoute.get("/all", verifyToken_1.verifyToken, userLocation_1.getUserLocation);
userLocationRoute.put("/update", verifyToken_1.verifyToken, userLocation_1.updateUserLocation);
userLocationRoute.delete("/delete", verifyToken_1.verifyToken, userLocation_1.deleteUserLocation);
exports.default = userLocationRoute;
