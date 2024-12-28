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
exports.getUserLocation = exports.deleteUserLocation = exports.updateUserLocation = exports.createUserLocation = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const db_1 = __importDefault(require("../db/db"));
const userLocation_1 = require("../model/userLocation");
const create_userLocation_dtos_1 = require("../dtos/create-userLocation.dtos");
const user_1 = require("../model/user");
const sellerLocation_1 = require("../model/sellerLocation");
const userLocationRepository = db_1.default.getRepository(userLocation_1.UserLocation);
const sellerLocationRepository = db_1.default.getRepository(sellerLocation_1.SellerLocation);
const userRepository = db_1.default.getRepository(user_1.User);
const createUserLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.query.userId);
        if (!req.query || isNaN(userId)) {
            res.status(404).json({
                success: false,
                message: "userId not found",
            });
            return;
        }
        const userLocation = (0, class_transformer_1.plainToInstance)(create_userLocation_dtos_1.UserLocationDto, req.body);
        const errors = yield (0, class_validator_1.validate)(userLocation);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const userData = yield userRepository.findOneBy({
            id: userId,
        });
        if (!userData) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        const sellerLocation = yield sellerLocationRepository.findOneBy({
            id: Number(req.body.delivery),
        });
        if (!sellerLocation) {
            res.status(404).json({
                success: false,
                message: "seller location not found",
            });
            return;
        }
        const userLocationData = yield userLocationRepository.create(Object.assign(Object.assign({}, req.body), { user: userData, sellerLocation: sellerLocation }));
        if (!userLocationData) {
            res.status(500).json({
                success: false,
                message: "something went wrong",
            });
            return;
        }
        yield userLocationRepository.save(userLocationData);
        res.status(200).json({
            success: true,
            message: "user location created successfully",
            data: userLocationData,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "something went wrong",
        });
        return;
    }
});
exports.createUserLocation = createUserLocation;
const updateUserLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locationId = Number(req.query.locationId);
        if (!req.query || isNaN(locationId)) {
            res.status(404).json({
                success: false,
                message: "userId not found",
            });
            return;
        }
        const userLocation = (0, class_transformer_1.plainToInstance)(create_userLocation_dtos_1.UpdateUserLocationDto, req.body);
        const errors = yield (0, class_validator_1.validate)(userLocation);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const userLocationData = yield userLocationRepository.findOneBy({
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
        yield userLocationRepository.save(userLocationData);
        res.status(200).json({
            success: true,
            message: "user location updated successfully",
            data: userLocationData,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "something went wrong",
        });
        return;
    }
});
exports.updateUserLocation = updateUserLocation;
const deleteUserLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locationId = Number(req.query.locationId);
        if (!req.query || isNaN(locationId)) {
            res.status(404).json({
                success: false,
                message: "userId not found",
            });
            return;
        }
        const userLocationData = yield userLocationRepository.findOneBy({
            id: locationId,
        });
        if (!userLocationData) {
            res.status(500).json({
                success: false,
                message: "Location details not found",
            });
            return;
        }
        yield userLocationRepository.delete(locationId);
        res.status(200).json({
            success: true,
            message: "user location deleted successfully",
            data: userLocationData,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "something went wrong",
        });
        return;
    }
});
exports.deleteUserLocation = deleteUserLocation;
const getUserLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(req.query.userId);
        if (!req.query || isNaN(userId)) {
            res.status(404).json({
                success: false,
                message: "userId not found",
            });
            return;
        }
        const userLocationData = yield userLocationRepository.find({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "something went wrong",
        });
        return;
    }
});
exports.getUserLocation = getUserLocation;
