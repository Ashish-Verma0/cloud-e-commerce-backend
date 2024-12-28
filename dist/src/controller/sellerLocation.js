"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocationById = exports.getAllLocationBySeller = exports.updateLocation = exports.createLocation = void 0;
const class_transformer_1 = require("class-transformer");
const db_1 = __importDefault(require("../db/db"));
const sellerLocation_1 = require("../model/sellerLocation");
const class_validator_1 = require("class-validator");
const seller_1 = require("../model/seller");
const create_sellerLocation_1 = require("../dtos/create-sellerLocation");
const sellerLocationRepository = db_1.default.getRepository(sellerLocation_1.SellerLocation);
const sellerRepository = db_1.default.getRepository(seller_1.Seller);
const createLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
        if (!req.query || !shopName) {
            res.status(404).json({
                success: false,
                message: "shopName not found",
            });
            return;
        }
        const sellerLocationData = (0, class_transformer_1.plainToInstance)(create_sellerLocation_1.CreateSellerLocationDto, req.body);
        const errors = yield (0, class_validator_1.validate)(sellerLocationData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({ shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const sellerLocation = yield sellerLocationRepository.create(Object.assign(Object.assign({}, sellerLocationData), { seller }));
        if (!sellerLocation) {
            res.status(500).json({
                success: false,
                message: "something went wrong try again later",
            });
            return;
        }
        yield sellerLocationRepository.save(sellerLocation);
        res.status(201).json({
            success: true,
            message: "Location created successfully",
            data: sellerLocation,
        });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
exports.createLocation = createLocation;
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locationId = Number(req.query.locationId);
        if (!req.query || isNaN(locationId)) {
            res.status(404).json({
                success: false,
                message: "shopName not found",
            });
            return;
        }
        const sellerLocationData = (0, class_transformer_1.plainToInstance)(create_sellerLocation_1.UpdateSellerLocationDto, req.body);
        // Number(sellerLocationData.deliveryPrice)
        const errors = yield (0, class_validator_1.validate)(sellerLocationData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const sellerLocation = yield sellerLocationRepository.findOneBy({
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
        yield sellerLocationRepository.save(sellerLocation);
        res.status(201).json({
            success: true,
            message: "Location updated successfully",
            data: sellerLocation,
        });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
exports.updateLocation = updateLocation;
const getAllLocationBySeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopName, page = "1", limit = "10" } = req.query;
        if (!shopName) {
            res.status(404).json({
                success: false,
                message: "shopName not found",
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({ shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "Seller not found",
            });
            return;
        }
        // const pageNumber = parseInt(page, 10);
        // const pageSize = parseInt(limit, 10);
        // const offset = (pageNumber - 1) * pageSize;
        const [locations, totalCategories] = yield sellerLocationRepository.findAndCount({
            where: { seller: { shopName } },
            // skip: offset,
            // take: pageSize,
            // relations: ["seller"],
        });
        if (!locations.length) {
            res.status(404).json({
                success: false,
                message: "No locations found",
            });
            return;
        }
        // const totalPages = Math.ceil(totalCategories / pageSize);
        res.status(200).json({
            success: true,
            message: "Locations found successfully",
            data: {
                location: locations,
                // pagination: {
                //   totalCategories,
                //   totalPages,
                //   currentPage: pageNumber,
                //   resultPerPage: pageSize,
                // },
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.getAllLocationBySeller = getAllLocationBySeller;
const deleteLocationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locationId = Number(req.query.locationId);
        if (!req.query || isNaN(locationId)) {
            res.status(404).json({
                success: false,
                message: "locationId not found",
            });
            return;
        }
        const location = yield sellerLocationRepository.findOneBy({
            id: locationId,
        });
        if (!location) {
            res.status(404).json({
                success: false,
                message: "location not foun",
            });
            return;
        }
        yield sellerLocationRepository.delete(locationId);
        res.status(201).json({
            success: true,
            message: "Location deleted successfully",
            data: location,
        });
        return;
    }
    catch (error) {
        console.log(error);
        if (error.code) {
            switch (error.code) {
                case "23503":
                    res.status(400).json({
                        success: false,
                        message: "Location cannot be deleted as it is associated with other entities.",
                    });
                    break;
                default:
                    res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                    });
                    break;
            }
        }
        else {
            res.status(500).json({
                success: false,
                message: "An unexpected error occurred.",
            });
        }
    }
});
exports.deleteLocationById = deleteLocationById;
