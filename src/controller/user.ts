import { data } from "../../contant";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../model/user";
import AppDataSource from "../db/db";
import sendToken from "../../utils/sendToken";
import sendEmail from "../../utils/sendEmail";
const userRepository = AppDataSource.getRepository(User);

interface MulterRequest extends Request {
  file?: {
    filename: string;
    path: string;
    mimetype: string;
  };
}
interface MulterForUpdateRequest extends Request {
  file?: {
    filename: string;
    path: string;
    mimetype: string;
  };
  user?: {
    id: number;
    isAdmin?: boolean;
    [key: string]: any;
  };
}
export interface CustomRequest extends Request {
  user?: {
    id: number;
    isAdmin?: boolean;
    [key: string]: any;
  };
}

export const createUser = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  try {
    // if (!req?.file) {
    //   throw new Error("File not uploaded");
    // }
    const passwoedHash = await bcrypt.hashSync(req.body.password, 10);

    const user = userRepository.create({
      ...req.body,
      password: passwoedHash,
    });
    // const user = userRepository.create({
    //   ...req.body,
    //   password: passwoedHash,
    //   avatar: req?.file || null,
    // });

    const savedUser = await userRepository.save(user);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      // status: 201,
      user: savedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepository.findOneBy({ email: req.body.email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    const isPasswordMatched = await bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordMatched) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    const token = await jwt.sign({ id: user.id }, data.jwt_secret, {
      expiresIn: "1h",
    });

    await sendToken(user, 200, res, token);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const userProfile = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userRepository.findOneBy({ id: req?.user?.id });

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
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const userById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepository.findOneBy({ id: Number(req?.params.id) });

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
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const userUpdate = async (
  req: MulterForUpdateRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userRepository.findOneBy({ id: req.user.id });
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

    await userRepository.save(user);
    res
      .status(200)
      .json({ success: true, message: "user found successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const updatePassword = async (
  req: MulterForUpdateRequest,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;
    const user = await userRepository.findOneBy({ id: req.user.id });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    const oldPassword = await bcrypt.compareSync(password, user.password);

    if (!oldPassword) {
      res.status(404).json({
        success: false,
        message: "old password is incorrect",
      });
      return;
    }

    const hashedPassword = await bcrypt.hashSync(password, 10);
    user.password = hashedPassword;

    await userRepository.save(user);
    res.status(200).json({
      success: true,
      message: "user password changes successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const verifyEmail = async (
  req: MulterForUpdateRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await userRepository.findOneBy({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
      return;
    }

    const token = await jwt.sign({ id: user.id }, data.jwt_secret, {
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

    await sendEmail(emailData);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
    return;
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password, token } = req.body;

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "You are not authenticated" });
      return;
    }

    const decoded = jwt.verify(token, data.jwt_secret as string) as {
      id: string;
    };

    if (!decoded) {
      res.status(401).json({ success: false, message: "Token is not valid" });
      return;
    }

    const user = await userRepository.findOneBy({ id: Number(decoded.id) });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await userRepository.save(user);

    res.status(200).json({
      success: true,
      message: "User password changed successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error resetting password", error });
  }
};
