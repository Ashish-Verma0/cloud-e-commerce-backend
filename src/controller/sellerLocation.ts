import { plainToInstance } from "class-transformer";
import AppDataSource from "../db/db";
import { SellerLocation } from "../model/sellerLocation";
import { CreateSellerDTO } from "../dtos/create-seller.dto";
import { validate } from "class-validator";
import { Response, Request } from "express";
import { Seller } from "../model/seller";
import {
  CreateSellerLocationDto,
  UpdateSellerLocationDto,
} from "../dtos/create-sellerLocation";

const sellerLocationRepository = AppDataSource.getRepository(SellerLocation);
const sellerRepository = AppDataSource.getRepository(Seller);

interface QueryRequest extends Request {
  query: {
    shopName?: string;
    page?: string;
    limit?: string;
    locationId: string;
  };
}

export const createLocation = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName;

    if (!req.query || !shopName) {
      res.status(404).json({
        success: false,
        message: "shopName not found",
      });
      return;
    }

    const sellerLocationData = plainToInstance(
      CreateSellerLocationDto,
      req.body
    );

    const errors = await validate(sellerLocationData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const sellerLocation = await sellerLocationRepository.create({
      ...sellerLocationData,
      seller,
    });

    if (!sellerLocation) {
      res.status(500).json({
        success: false,
        message: "something went wrong try again later",
      });
      return;
    }

    await sellerLocationRepository.save(sellerLocation);

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: sellerLocation,
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

export const updateLocation = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const locationId = Number(req.query.locationId);

    if (!req.query || isNaN(locationId)) {
      res.status(404).json({
        success: false,
        message: "shopName not found",
      });
      return;
    }

    const sellerLocationData = plainToInstance(
      UpdateSellerLocationDto,
      req.body
    );

    // Number(sellerLocationData.deliveryPrice)

    const errors = await validate(sellerLocationData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const sellerLocation = await sellerLocationRepository.findOneBy({
      id: locationId,
    });

    if (!sellerLocation) {
      res.status(404).json({
        success: false,
        message: "location not found",
      });
      return;
    }

    sellerLocation.area = sellerLocationData.area;
    sellerLocation.city = sellerLocationData.city;
    sellerLocation.pinCode = sellerLocationData.pinCode;
    sellerLocation.deliveryPrice = sellerLocationData.deliveryPrice;
    sellerLocation.deliveryTime = sellerLocationData.deliveryTime;
    sellerLocation.state = sellerLocationData.state;

    await sellerLocationRepository.save(sellerLocation);

    res.status(201).json({
      success: true,
      message: "Location updated successfully",
      data: sellerLocation,
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

export const getAllLocationBySeller = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const { shopName, page = "1", limit = "10" } = req.query;

    if (!shopName) {
      res.status(404).json({
        success: false,
        message: "shopName not found",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "Seller not found",
      });
      return;
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const offset = (pageNumber - 1) * pageSize;

    const [locations, totalCategories] =
      await sellerLocationRepository.findAndCount({
        where: { seller: { shopName } },
        skip: offset,
        take: pageSize,
        // relations: ["seller"],
      });

    if (!locations.length) {
      res.status(404).json({
        success: false,
        message: "No locations found",
      });
      return;
    }

    const totalPages = Math.ceil(totalCategories / pageSize);

    res.status(200).json({
      success: true,
      message: "Locations found successfully",
      data: {
        location: locations,
        pagination: {
          totalCategories,
          totalPages,
          currentPage: pageNumber,
          resultPerPage: pageSize,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteLocationById = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const locationId = Number(req.query.locationId);

    if (!req.query || isNaN(locationId)) {
      res.status(404).json({
        success: false,
        message: "locationId not found",
      });
      return;
    }

    const location = await sellerLocationRepository.findOneBy({
      id: locationId,
    });

    if (!location) {
      res.status(404).json({
        success: false,
        message: "location not foun",
      });
      return;
    }

    await sellerLocationRepository.delete(locationId);
    res.status(201).json({
      success: true,
      message: "Location deleted successfully",
      data: location,
    });
    return;
  } catch (error) {
    console.log(error);
    if (error.code) {
      switch (error.code) {
        case "23503":
          res.status(400).json({
            success: false,
            message:
              "Location cannot be deleted as it is associated with other entities.",
          });
          break;
        default:
          res.status(500).json({
            success: false,
            message: "Internal server error.",
          });
          break;
      }
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred.",
      });
    }
  }
};
