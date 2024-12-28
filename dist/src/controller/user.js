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
exports.forgotPassword = exports.verifyEmail = exports.updatePassword = exports.userUpdate = exports.userById = exports.userProfile = exports.loginUser = exports.createUser = void 0;
const contant_1 = require("../../contant");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = require("../model/user");
const db_1 = __importDefault(require("../db/db"));
const sendToken_1 = __importDefault(require("../../utils/sendToken"));
const sendEmail_1 = __importDefault(require("../../utils/sendEmail"));
const userRepository = db_1.default.getRepository(user_1.User);
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if (!req?.file) {
        //   throw new Error("File not uploaded");
        // }
        const passwoedHash = yield bcryptjs_1.default.hashSync(req.body.password, 10);
        const user = userRepository.create(Object.assign(Object.assign({}, req.body), { password: passwoedHash, avatar: req === null || req === void 0 ? void 0 : req.file }));
        const savedUser = yield userRepository.save(user);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            // status: 201,
            user: savedUser,
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.createUser = createUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRepository.findOneBy({ email: req.body.email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        const isPasswordMatched = yield bcryptjs_1.default.compareSync(req.body.password, user.password);
        if (!isPasswordMatched) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        const token = yield jsonwebtoken_1.default.sign({ id: user.id }, contant_1.data.jwt_secret, {
            expiresIn: "1h",
        });
        yield (0, sendToken_1.default)(user, 200, res, token);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.loginUser = loginUser;
const userProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield userRepository.findOneBy({ id: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: "user found successfully", user });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.userProfile = userProfile;
const userById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRepository.findOneBy({ id: Number(req === null || req === void 0 ? void 0 : req.params.id) });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: "user found successfully", user });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.userById = userById;
const userUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRepository.findOneBy({ id: req.user.id });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        if (req.file) {
            user.avatar = req.file;
        }
        yield userRepository.save(user);
        res
            .status(200)
            .json({ success: true, message: "user found successfully", user });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.userUpdate = userUpdate;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const user = yield userRepository.findOneBy({ id: req.user.id });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        const oldPassword = yield bcryptjs_1.default.compareSync(password, user.password);
        if (!oldPassword) {
            res.status(404).json({
                success: false,
                message: "old password is incorrect",
            });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hashSync(password, 10);
        user.password = hashedPassword;
        yield userRepository.save(user);
        res.status(200).json({
            success: true,
            message: "user password changes successfully",
            user,
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.updatePassword = updatePassword;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userRepository.findOneBy({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "user not found",
            });
            return;
        }
        const token = yield jsonwebtoken_1.default.sign({ id: user.id }, contant_1.data.jwt_secret, {
            expiresIn: "1h",
        });
        const emailData = {
            email: user.email,
            subject: "Reset Your Password",
            message: `
        <p>Click the link below to reset your password:</p>
        <a href="http://192.168.1.20:3000/forgot-password/${token}" target="_blank">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
        };
        yield (0, sendEmail_1.default)(emailData);
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });
        return;
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
});
exports.verifyEmail = verifyEmail;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, token } = req.body;
        if (!token) {
            res
                .status(401)
                .json({ success: false, message: "You are not authenticated" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, contant_1.data.jwt_secret);
        if (!decoded) {
            res.status(401).json({ success: false, message: "Token is not valid" });
            return;
        }
        const user = yield userRepository.findOneBy({ id: Number(decoded.id) });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        user.password = hashedPassword;
        yield userRepository.save(user);
        res.status(200).json({
            success: true,
            message: "User password changed successfully",
        });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res
            .status(500)
            .json({ success: false, message: "Error resetting password", error });
    }
});
exports.forgotPassword = forgotPassword;
