import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import AppDataSource from "../db/db";

import { UserLocation } from "../model/userLocation";
import {
  UpdateUserLocationDto,
  UserLocationDto,
} from "../dtos/create-userLocation.dtos";
import { User } from "../model/user";
import { SellerLocation } from "../model/sellerLocation";

const userLocationRepository = AppDataSource.getRepository(UserLocation);
const sellerLocationRepository = AppDataSource.getRepository(SellerLocation);
const userRepository = AppDataSource.getRepository(User);

interface QueryRequest extends Request {
  query: {
    userId?: string;
    locationId?: string;
  };
}

export const createUserLocation = async (req: QueryRequest, res: Response) => {
  try {
    const userId = Number(req.query.userId);
    if (!req.query || isNaN(userId)) {
      res.status(404).json({
        success: false,
        message: "userId not found",
      });
      return;
    }

    const userLocation = plainToInstance(UserLocationDto, req.body);

    const errors = await validate(userLocation);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const userData = await userRepository.findOneBy({
      id: userId,
    });

    if (!userData) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    const sellerLocation = await sellerLocationRepository.findOneBy({
      id: Number(req.body.delivery),
    });
    if (!sellerLocation) {
      res.status(404).json({
        success: false,
        message: "seller location not found",
      });
      return;
    }

    const userLocationData = await userLocationRepository.create({
      ...req.body,
      user: userData,
      sellerLocation: sellerLocation,
    });

    if (!userLocationData) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
      return;
    }

    await userLocationRepository.save(userLocationData);

    res.status(200).json({
      success: true,
      message: "user location created successfully",
      data: userLocationData,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
    return;
  }
};

export const updateUserLocation = async (req: QueryRequest, res: Response) => {
  try {
    const locationId = Number(req.query.locationId);

    if (!req.query || isNaN(locationId)) {
      res.status(404).json({
        success: false,
        message: "userId not found",
      });
      return;
    }

    const userLocation = plainToInstance(UpdateUserLocationDto, req.body);

    const errors = await validate(userLocation);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const userLocationData = await userLocationRepository.findOneBy({
      id: locationId,
    });

    if (!userLocationData) {
      res.status(500).json({
        success: false,
        message: "Location details not found",
      });
      return;
    }

    userLocationData.area = userLocation.area;
    userLocationData.city = userLocation.city;
    userLocationData.fullAddress = userLocation.fullAddress;
    userLocationData.name = userLocation.name;
    userLocationData.phoneNumber = userLocation.phoneNumber;
    userLocationData.pinCode = userLocation.pinCode;
    userLocationData.state = userLocation.state;

    await userLocationRepository.save(userLocationData);

    res.status(200).json({
      success: true,
      message: "user location updated successfully",
      data: userLocationData,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
    return;
  }
};

export const deleteUserLocation = async (req: QueryRequest, res: Response) => {
  try {
    const locationId = Number(req.query.locationId);

    if (!req.query || isNaN(locationId)) {
      res.status(404).json({
        success: false,
        message: "userId not found",
      });
      return;
    }

    const userLocationData = await userLocationRepository.findOneBy({
      id: locationId,
    });

    if (!userLocationData) {
      res.status(500).json({
        success: false,
        message: "Location details not found",
      });
      return;
    }

    await userLocationRepository.delete(locationId);

    res.status(200).json({
      success: true,
      message: "user location deleted successfully",
      data: userLocationData,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
    return;
  }
};

export const getUserLocation = async (req: QueryRequest, res: Response) => {
  try {
    const userId = Number(req.query.userId);

    if (!req.query || isNaN(userId)) {
      res.status(404).json({
        success: false,
        message: "userId not found",
      });
      return;
    }

    const userLocationData = await userLocationRepository.find({
      where: { user: { id: userId } },
      relations: ["sellerLocation"],
    });

    if (!userLocationData) {
      res.status(500).json({
        success: false,
        message: "Location details not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Locations found successfully",
      data: userLocationData,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
    return;
  }
};
