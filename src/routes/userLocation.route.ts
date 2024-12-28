import { verifyToken } from "../../utils/verifyToken";
import express from "express";
import {
  createUserLocation,
  deleteUserLocation,
  getUserLocation,
  updateUserLocation,
} from "../controller/userLocation";

const userLocationRoute = express.Router();

userLocationRoute.post("/create", verifyToken, createUserLocation);
userLocationRoute.get("/all", verifyToken, getUserLocation);
userLocationRoute.put("/update", verifyToken, updateUserLocation);
userLocationRoute.delete("/delete", verifyToken, deleteUserLocation);

export default userLocationRoute;
