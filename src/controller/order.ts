import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";
import AppDataSource from "../db/db";
import { Orders } from "../model/orders";
import { Seller } from "../model/seller";
import { User } from "../model/user";
import { Product } from "../model/product";
import { CreateOrderDto, UpdateOrderDto } from "../dtos/create-order.dtos";

const orderRepository = AppDataSource.getRepository(Orders);
const sellerRepository = AppDataSource.getRepository(Seller);
const userRepository = AppDataSource.getRepository(User);
const productRepository = AppDataSource.getRepository(Product);

interface QueryRequest extends Request {
  query: {
    orderId?: string;
    shopName?: string;
  };
}

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderData = plainToInstance(CreateOrderDto, req.body);
    orderData.productId = Number(req.body.productId);
    orderData.userId = Number(req.body.userId);
    const errors = await validate(orderData);
    // console.log("req.body", orderData);
    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const { shopName, productId, userId, ...orderDetails } = orderData;

    const seller = await sellerRepository.findOneBy({
      shopName: shopName.toString(),
    });

    const user = await userRepository.findOneBy({ id: userId });
    const product = await productRepository.findOneBy({
      id: productId,
    });

    if (!seller || !user || !product) {
      res.status(404).json({
        success: false,
        message: "Invalid sellerId, userId, or productId",
      });
      return;
    }

    const newOrder = orderRepository.create({
      ...orderDetails,
      seller,
      user,
      product,
      status: "pending",
    });

    await orderRepository.save(newOrder);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateOrder = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const orderId = Number(req.query.orderId);
    if (!req.query || !orderId) {
      res.status(404).json({
        success: false,
        message: "orderId is required",
      });
      return;
    }

    const order = await orderRepository.findOneBy({ id: orderId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const updateData = plainToInstance(UpdateOrderDto, req.body);
    const errors = await validate(updateData);

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    order.status = updateData.status;

    await orderRepository.save(order);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrdersBySeller = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName?.toString();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!shopName) {
      res.status(404).json({
        success: false,
        message: "shopName is required",
      });
      return;
    }

    const sellerData = await sellerRepository.findOneBy({
      shopName,
    });

    if (!sellerData) {
      res.status(404).json({
        success: false,
        message: "Seller not found",
      });
      return;
    }

    const [orders, totalOrders] = await orderRepository.findAndCount({
      where: { seller: { shopName: sellerData.shopName } },
      relations: ["user", "product"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      message: "Orders found successfully",
      data: {
        order: orders,
        pagination: {
          totalOrders,
          totalPages,
          currentPage: page,
          resultPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrdersByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!req.query || isNaN(userId)) {
      res.status(404).json({
        success: false,
        message: "shopName is required",
      });
      return;
    }

    const userData = await userRepository.findOneBy({
      id: userId,
    });

    if (!userData) {
      res.status(404).json({
        success: false,
        message: "userData not found",
      });
      return;
    }

    const [orders, totalOrders] = await orderRepository.findAndCount({
      where: { user: { id: userData.id } },
      relations: ["product"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      message: "Orders found successfully",
      data: {
        order: orders,
        pagination: {
          totalOrders,
          totalPages,
          currentPage: page,
          resultPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = Number(req.query.orderId);

    if (!req.query || !orderId) {
      res.status(404).json({
        success: false,
        message: "orderId is required",
      });
      return;
    }

    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ["seller", "user", "product"],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = Number(req.query.orderId);

    if (!req.query || !orderId) {
      res.status(404).json({
        success: false,
        message: "orderId is required",
      });
      return;
    }

    const order = await orderRepository.findOneBy({ id: orderId });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    await orderRepository.remove(order);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    if (error.code) {
      switch (error.code) {
        case "23503":
          res.status(400).json({
            success: false,
            message:
              "Product cannot be deleted as it is associated with other entities.",
          });
          break;
        default:
          res.status(500).json({
            success: false,
            message: "Internal server error.",
          });
          break;
      }
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred.",
      });
    }
  }
};
