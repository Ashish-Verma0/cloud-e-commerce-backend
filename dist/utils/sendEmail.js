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
const nodemailer_1 = __importDefault(require("nodemailer"));
const contant_1 = require("../contant");
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: contant_1.data.SMPT_HOST,
        port: Number(contant_1.data.SMPT_PORT),
        service: contant_1.data.SMPT_SERVICE,
        auth: {
            user: contant_1.data.SMPT_MAIL,
            pass: contant_1.data.SMPT_PASSWORD,
        },
    });
    const mailOptions = {
        from: contant_1.data.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    yield transporter.sendMail(mailOptions);
});
exports.default = sendEmail;
