import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { data } from "../contant";

interface CustomRequest extends Request {
  user?: any;
  seller?: any;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token =
      req?.cookies?.access_token || req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "You are not authenticated" });
      return;
    }

    jwt.verify(token, data.jwt_secret as string, (err, user) => {
      if (err) {
        res.status(401).json({ success: false, message: "Token is not valid" });
        return;
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An error occurred", error });
  }
};
export const verifySellerToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token =
      req?.cookies?.seller_token || req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "You are not authenticated" });
      return;
    }

    jwt.verify(token, data.seller_jwt_secret as string, (err, seller) => {
      if (err) {
        res.status(401).json({ success: false, message: "Token is not valid" });
        return;
      }
      req.seller = seller;
      next();
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An error occurred", error });
  }
};

export const verifyUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  verifyToken(req, res, () => {
    if (req.user?.id === req.params.id || req.user?.isAdmin) {
      next();
    } else {
      res
        .status(401)
        .json({ success: false, message: "You are not authorized" });
    }
  });
};

export const verifyIsAdmin = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req?.cookies?.access_token;

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "You are not authenticated" });
      return;
    }

    jwt.verify(token, data.jwt_secret as string, (err, user) => {
      if (err) {
        res.status(401).json({ success: false, message: "Token is not valid" });
        return;
      }

      req.user = user;

      if (user?.isAdmin) {
        next();
      } else {
        res.status(401).json({ success: false, message: "You are not Admin" });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An error occurred", error });
  }
};
