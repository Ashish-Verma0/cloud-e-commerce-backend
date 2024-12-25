import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import AppDataSource from "../db/db";
import { Seller } from "../model/seller";
import { CreateSellerDTO, LoginSellerDTO } from "../dtos/create-seller.dto";
import { compareSync, hashSync } from "bcryptjs";
import sendEmail from "../../utils/sendEmail";
import crypto from "crypto";
import { data } from "../../contant";
import { sendTokenToSeller } from "../../utils/sendToken";

const sellerRepository = AppDataSource.getRepository(Seller);

interface MulterRequest extends Request {
  file?: {
    filename: string;
    path: string;
    mimetype: string;
  };
}

export const createSeller = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerData = plainToInstance(CreateSellerDTO, req.body);
    if (req.file) {
      sellerData.shopLogo = req.file.filename;
    }
    const isEmailExists = await sellerRepository.findOneBy({
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
    const errors = await validate(sellerData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const hashedPassword = await hashSync(sellerData.ownerPassword, 10);
    const seller = sellerRepository.create({
      ...sellerData,
      ownerPassword: hashedPassword,
    });
    await sellerRepository.save(seller);

    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller,
    });
  } catch (error) {
    console.error("Error creating seller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginSeller = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sellerData = plainToInstance(LoginSellerDTO, req.body);

    const errors = await validate(sellerData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }
    const isSeller = await sellerRepository.findOneBy({
      ownerEmail: req.body.ownerEmail,
    });

    if (!isSeller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const isPasswordMatched = await compareSync(
      req.body.ownerPassword,
      isSeller.ownerPassword
    );

    if (!isPasswordMatched) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const token = await jwt.sign({ id: isSeller.id }, data.seller_jwt_secret, {
      expiresIn: "1h",
    });

    await sendTokenToSeller(isSeller, 200, res, token);

    // res.status(200).json({
    //   success: true,
    //   message: "seller login successfully",
    //   data: isSeller,
    // });
    // return;
  } catch (error) {
    console.error("Error creating seller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export interface CustomRequest extends Request {
  seller?: {
    id: number;
  };
}

export const sellerProfile = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const seller = await sellerRepository.findOneBy({ id: req.seller.id });

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
  } catch (error) {
    console.error("Error in verifySeller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const verifySellerEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ownerEmail } = req.body;

    const seller = await sellerRepository.findOneBy({ ownerEmail });

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
        message:
          "Your OTP is still valid. Please wait for it to expire before generating a new one.",
      });
      return;
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const newOtpExpiry = new Date(currentTime.getTime() + 5 * 60 * 1000);

    await sellerRepository.update(seller.id, {
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

    await sendEmail(emailData);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
    return;
  } catch (error) {
    console.error("Error in verifySeller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const verifySellerOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { otpCode } = req.body;

    const seller = await sellerRepository.findOneBy({ otpCode });

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

    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};
