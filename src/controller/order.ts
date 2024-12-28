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
    // console.log("orderData", orderData);
    const errors = await validate(orderData);

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const { shopName, userId, orderedItem, ...orderDetails } = orderData;

    const seller = await sellerRepository.findOneBy({ shopName });
    const user = await userRepository.findOneBy({ id: userId });

    if (!seller || !user) {
      res.status(404).json({
        success: false,
        message: "Invalid seller or user information",
      });
      return;
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const productDetails = await Promise.all(
        orderedItem.map(async (item) => {
          const product = await transactionalEntityManager
            .getRepository(Product)
            .createQueryBuilder("product")
            .where("product.id = :id", { id: item.productId })
            .setLock("pessimistic_write")
            .getOne();

          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Product ${item.productId} is unavailable or out of stock`
            );

            // res.status(500).json({
            //   success: false,
            //   message: `Product ${item.productId} is unavailable or out of stock`,
            // });
            // return;
          }

          product.stock -= item.quantity;
          await transactionalEntityManager.save(product);

          return { ...product, orderQuantity: item.quantity };
        })
      );

      const newOrder = transactionalEntityManager.create(Orders, {
        ...orderDetails,
        seller,
        user,
        orderedItems: orderedItem,
        status: "pending",
      });

      await transactionalEntityManager.save(newOrder);

      // Emit stock update event
      // io.emit(
      //   "product-updated",
      //   productDetails.map((product) => ({
      //     productId: product.id,
      //     updatedStock: product.stock,
      //   }))
      // );

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          ...newOrder,
          orderedItems: productDetails.map((product) => ({
            productId: product.id,
            title: product.title,
            desc: product.desc,
            price: product.price,
            orderQuantity: product.orderQuantity,
            remainingStock: product.stock,
            productimage: product.productimage,
          })),
        },
      });
    });
    return;
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
    return;
  }
};

// export const createOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const orderData = plainToInstance(CreateOrderDto, req.body);

//     const errors = await validate(orderData);

//     if (errors.length > 0) {
//       res.status(400).json({ success: false, errors });
//       return;
//     }

//     const { shopName, userId, orderedItem, ...orderDetails } = orderData;

//     const seller = await sellerRepository.findOneBy({ shopName });
//     const user = await userRepository.findOneBy({ id: userId });

//     if (!seller || !user) {
//       res.status(404).json({
//         success: false,
//         message: "Invalid seller or user information",
//       });
//       return;
//     }

//     const orderedItemsWithDetails = [];

//     for (const item of orderedItem) {
//       const product = await productRepository.findOneBy({ id: item.productId });

//       if (!product) {
//         res.status(404).json({
//           success: false,
//           message: `Product with id ${item.productId} not found`,
//         });
//         return;
//       }

//       if (product.stock < item.quantity) {
//         res.status(400).json({
//           success: false,
//           message: `Insufficient stock for product: ${product.title}`,
//         });
//         return;
//       }

//       // Deduct stock and save
//       product.stock -= item.quantity;
//       await productRepository.save(product);

//       // Add product details to response
//       orderedItemsWithDetails.push({
//         productId: product.id,
//         title: product.title,
//         desc: product.desc,
//         price: product.price,
//         orderQuantity: item.quantity,
//         remainingStock: product.stock, // Reflect updated stock
//         productimage: product.productimage,
//       });
//     }

//     const newOrder = orderRepository.create({
//       ...orderDetails,
//       seller,
//       user,
//       orderedItems: orderedItem,
//       status: "pending",
//     });

//     await orderRepository.save(newOrder);

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: {
//         ...newOrder,
//         orderedItems: orderedItemsWithDetails,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// export const createOrder = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const orderData = plainToInstance(CreateOrderDto, req.body);

//     const errors = await validate(orderData);

//     if (errors.length > 0) {
//       res.status(400).json({ success: false, errors });
//       return;
//     }

//     const { shopName, userId, orderedItem, ...orderDetails } = orderData;

//     const seller = await sellerRepository.findOneBy({ shopName });
//     const user = await userRepository.findOneBy({ id: userId });

//     if (!seller || !user) {
//       res.status(404).json({
//         success: false,
//         message: "Invalid seller or user information",
//       });
//       return;
//     }

//     // Fetch and validate all products in orderedItem
//     const productDetails = await Promise.all(
//       orderedItem.map(async (item) => {
//         const product = await productRepository.findOneBy({
//           id: item.productId,
//         });
//         console.log("item", item);
//         if (!product || product.stock < item.quantity) {
//           throw new Error(
//             `Product ${item.productId} is unavailable or out of stock`
//           );
//         }
//         return { ...product, orderQuantity: item.quantity };
//       })
//     );

//     // Update stock for each product
//     await Promise.all(
//       productDetails.map(async (product) => {
//         product.stock -= product.orderQuantity;
//         await productRepository.save(product);
//       })
//     );

//     // Create and save the order
//     const newOrder = orderRepository.create({
//       ...orderDetails,
//       seller,
//       user,
//       orderedItems: orderedItem,
//       status: "pending",
//     });

//     await orderRepository.save(newOrder);

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: {
//         ...newOrder,
//         orderedItems: productDetails.map((product) => ({
//           productId: product.id,
//           title: product.title,
//           desc: product.desc,
//           price: product.price,
//           orderQuantity: product.orderQuantity,
//           remainingStock: product.stock,
//           productimage: product.productimage,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

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
      res.status(400).json({
        success: false,
        message: "shopName is required",
      });
      return;
    }

    const sellerData = await sellerRepository.findOneBy({ shopName });

    if (!sellerData) {
      res.status(404).json({
        success: false,
        message: "Seller not found",
      });
      return;
    }

    const [orders, totalOrders] = await orderRepository.findAndCount({
      where: { seller: { shopName: sellerData.shopName } },
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    if (!orders.length) {
      res.status(200).json({
        success: true,
        message: "No orders found",
        data: {
          orders: [],
          pagination: {
            totalOrders: 0,
            totalPages: 0,
            currentPage: page,
            resultPerPage: limit,
          },
        },
      });
      return;
    }

    const productIds = Array.from(
      new Set(
        orders.flatMap((order) =>
          order.orderedItems.map((item) => item.productId)
        )
      )
    );

    const products = await productRepository.findByIds(productIds);

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const ordersWithDetails = orders.map((order) => {
      const orderedItemsWithDetails = order.orderedItems.map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return {
          productId: product.id,
          title: product.title,
          desc: product.desc,
          price: product.price,
          orderQuantity: item.quantity,
          remainingStock: product.stock,
          productimage: product.productimage,
        };
      });

      return {
        ...order,
        orderedItems: orderedItemsWithDetails,
      };
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      message: "Orders found successfully",
      data: {
        orders: ordersWithDetails,
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
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
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

    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "userId is required and should be a valid number",
      });
      return;
    }

    const userData = await userRepository.findOneBy({
      id: userId,
    });

    if (!userData) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const [orders, totalOrders] = await orderRepository.findAndCount({
      where: { user: { id: userData.id } },
      // relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    if (!orders.length) {
      res.status(200).json({
        success: true,
        message: "No orders found",
        data: {
          orders: [],
          pagination: {
            totalOrders: 0,
            totalPages: 0,
            currentPage: page,
            resultPerPage: limit,
          },
        },
      });
      return;
    }

    const productIds = Array.from(
      new Set(
        orders.flatMap((order) =>
          order.orderedItems.map((item) => item.productId)
        )
      )
    );

    const products = await productRepository.findByIds(productIds);

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const ordersWithDetails = orders.map((order) => {
      const orderedItemsWithDetails = order.orderedItems.map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return {
          productId: product.id,
          title: product.title,
          desc: product.desc,
          price: product.price,
          orderQuantity: item.quantity,
          remainingStock: product.stock,
          productimage: product.productimage,
        };
      });

      return {
        ...order,
        orderedItems: orderedItemsWithDetails,
      };
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      message: "Orders found successfully",
      data: {
        orders: ordersWithDetails,
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
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// export const getOrderById = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const orderId = Number(req.query.orderId);

//     if (!req.query || !orderId) {
//       res.status(404).json({
//         success: false,
//         message: "orderId is required",
//       });
//       return;
//     }

//     const order = await orderRepository.findOne({
//       where: { id: orderId },
//       relations: ["seller", "user"],
//     });

//     if (!order) {
//       res.status(404).json({ success: false, message: "Order not found" });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = Number(req.query.orderId);

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: "orderId is required",
      });
      return;
    }

    const order = await orderRepository.findOne({
      where: { id: orderId },
      // relations: ["user"],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const productIds = Array.from(
      new Set(order.orderedItems.map((item) => item.productId))
    );

    const products = await productRepository.findByIds(productIds);

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const orderedItemsWithDetails = order.orderedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      return {
        productId: product.id,
        title: product.title,
        desc: product.desc,
        price: product.price,
        orderQuantity: item.quantity,
        remainingStock: product.stock,
        productimage: product.productimage,
      };
    });

    const orderWithDetails = {
      ...order,
      orderedItems: orderedItemsWithDetails,
    };

    res.status(200).json({
      success: true,
      message: "Order found successfully",
      data: orderWithDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
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
