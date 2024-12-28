"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIsAdmin = exports.verifyUser = exports.verifySellerToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const contant_1 = require("../contant");
const verifyToken = (req, res, next) => {
    var _a, _b, _c;
    try {
        const token = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.access_token) || ((_c = (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.split(" ")[1]);
        if (!token) {
            res
                .status(401)
                .json({ success: false, message: "You are not authenticated" });
            return;
        }
        jsonwebtoken_1.default.verify(token, contant_1.data.jwt_secret, (err, user) => {
            if (err) {
                res.status(401).json({ success: false, message: "Token is not valid" });
                return;
            }
            req.user = user;
            next();
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "An error occurred", error });
    }
};
exports.verifyToken = verifyToken;
const verifySellerToken = (req, res, next) => {
    var _a, _b, _c;
    try {
        const token = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.seller_token) || ((_c = (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.split(" ")[1]);
        if (!token) {
            res
                .status(401)
                .json({ success: false, message: "You are not authenticated" });
            return;
        }
        jsonwebtoken_1.default.verify(token, contant_1.data.seller_jwt_secret, (err, seller) => {
            if (err) {
                res.status(401).json({ success: false, message: "Token is not valid" });
                return;
            }
            req.seller = seller;
            next();
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "An error occurred", error });
    }
};
exports.verifySellerToken = verifySellerToken;
const verifyUser = (req, res, next) => {
    (0, exports.verifyToken)(req, res, () => {
        var _a, _b;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === req.params.id || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.isAdmin)) {
            next();
        }
        else {
            res
                .status(401)
                .json({ success: false, message: "You are not authorized" });
        }
    });
};
exports.verifyUser = verifyUser;
const verifyIsAdmin = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
        if (!token) {
            res
                .status(401)
                .json({ success: false, message: "You are not authenticated" });
            return;
        }
        jsonwebtoken_1.default.verify(token, contant_1.data.jwt_secret, (err, user) => {
            if (err) {
                res.status(401).json({ success: false, message: "Token is not valid" });
                return;
            }
            req.user = user;
            if (user === null || user === void 0 ? void 0 : user.isAdmin) {
                next();
            }
            else {
                res.status(401).json({ success: false, message: "You are not Admin" });
            }
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "An error occurred", error });
    }
};
exports.verifyIsAdmin = verifyIsAdmin;
