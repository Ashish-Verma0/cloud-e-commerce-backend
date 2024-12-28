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
exports.verifySellerOtp = exports.verifySellerEmail = exports.sellerProfile = exports.loginSeller = exports.createSeller = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const db_1 = __importDefault(require("../db/db"));
const seller_1 = require("../model/seller");
const create_seller_dto_1 = require("../dtos/create-seller.dto");
const bcryptjs_1 = require("bcryptjs");
const sendEmail_1 = __importDefault(require("../../utils/sendEmail"));
const crypto_1 = __importDefault(require("crypto"));
const contant_1 = require("../../contant");
const sendToken_1 = require("../../utils/sendToken");
const sellerRepository = db_1.default.getRepository(seller_1.Seller);
const createSeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerData = (0, class_transformer_1.plainToInstance)(create_seller_dto_1.CreateSellerDTO, req.body);
        if (req.file) {
            sellerData.shopLogo = req.file.filename;
        }
        const isEmailExists = yield sellerRepository.findOneBy({
            ownerEmail: req.body.ownerEmail,
        });
        if (isEmailExists) {
            res.status(400).json({
                success: false,
                message: "email already exists",
            });
            return;
        }
        if (req.body) {
            sellerData.shopVerified = Boolean(req.body.shopVerified);
        }
        const errors = yield (0, class_validator_1.validate)(sellerData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const hashedPassword = yield (0, bcryptjs_1.hashSync)(sellerData.ownerPassword, 10);
        const seller = sellerRepository.create(Object.assign(Object.assign({}, sellerData), { ownerPassword: hashedPassword }));
        yield sellerRepository.save(seller);
        res.status(201).json({
            success: true,
            message: "Seller created successfully",
            seller,
        });
    }
    catch (error) {
        console.error("Error creating seller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.createSeller = createSeller;
const loginSeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerData = (0, class_transformer_1.plainToInstance)(create_seller_dto_1.LoginSellerDTO, req.body);
        const errors = yield (0, class_validator_1.validate)(sellerData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const isSeller = yield sellerRepository.findOneBy({
            ownerEmail: req.body.ownerEmail,
        });
        if (!isSeller) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const isPasswordMatched = yield (0, bcryptjs_1.compareSync)(req.body.ownerPassword, isSeller.ownerPassword);
        if (!isPasswordMatched) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const token = yield jsonwebtoken_1.default.sign({ id: isSeller.id }, contant_1.data.seller_jwt_secret, {
            expiresIn: "1h",
        });
        yield (0, sendToken_1.sendTokenToSeller)(isSeller, 200, res, token);
        // res.status(200).json({
        //   success: true,
        //   message: "seller login successfully",
        //   data: isSeller,
        // });
        // return;
    }
    catch (error) {
        console.error("Error creating seller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.loginSeller = loginSeller;
const sellerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const seller = yield sellerRepository.findOneBy({ id: req.seller.id });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "you are not login",
            });
        }
        res.status(200).json({
            success: true,
            message: "Profile data",
            data: seller,
        });
        return;
    }
    catch (error) {
        console.error("Error in verifySeller:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
        });
    }
});
exports.sellerProfile = sellerProfile;
const verifySellerEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ownerEmail } = req.body;
        const seller = yield sellerRepository.findOneBy({ ownerEmail });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "Email not found",
            });
            return;
        }
        const currentTime = new Date();
        const otpExpiry = seller.otpExpiry ? new Date(seller.otpExpiry) : null;
        if (otpExpiry && currentTime <= otpExpiry) {
            res.status(400).json({
                success: false,
                message: "Your OTP is still valid. Please wait for it to expire before generating a new one.",
            });
            return;
        }
        const otpCode = crypto_1.default.randomInt(100000, 999999).toString();
        const newOtpExpiry = new Date(currentTime.getTime() + 1 * 60 * 1000);
        yield sellerRepository.update(seller.id, {
            otpCode,
            otpExpiry: newOtpExpiry,
        });
        const emailData = {
            email: seller.ownerEmail,
            subject: "Your Verification Code",
            message: `
        <p>Your OTP for verification is: <strong>${otpCode}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
        };
        yield (0, sendEmail_1.default)(emailData);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email.",
        });
        return;
    }
    catch (error) {
        console.error("Error in verifySeller:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
        });
    }
});
exports.verifySellerEmail = verifySellerEmail;
const verifySellerOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otpCode } = req.body;
        const seller = yield sellerRepository.findOneBy({ otpCode });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "Invalid OTP.",
            });
            return;
        }
        const currentTime = new Date();
        const otpExpiry = seller.otpExpiry ? new Date(seller.otpExpiry) : null;
        if (!otpExpiry || currentTime > otpExpiry) {
            res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP.",
            });
            return;
        }
        seller.shopVerified = true;
        // console.log("seller", seller);
        yield sellerRepository.save(seller);
        res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
        });
    }
    catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
        });
    }
});
exports.verifySellerOtp = verifySellerOtp;
