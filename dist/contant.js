"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = exports.data = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.data = {
    jwt_secret: process.env.JWT_SECRET,
    seller_jwt_secret: process.env.SELLER_JWT_SECRET,
    SMPT_SERVICE: process.env.SMPT_SERVICE,
    SMPT_MAIL: process.env.SMPT_MAIL,
    SMPT_PASSWORD: process.env.SMPT_PASSWORD,
    SMPT_HOST: process.env.SMPT_HOST,
    SMPT_PORT: process.env.SMPT_PORT,
};
exports.dbConfig = {
    Hostname: process.env.DB_HOSTNAME,
    Port: process.env.DB_PORT,
    Database: process.env.DB_DATABASE,
    Username: process.env.DB_USERNAME,
    Password: process.env.DB_PASSWORD,
};
