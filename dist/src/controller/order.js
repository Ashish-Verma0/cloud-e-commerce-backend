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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getOrderById = exports.getOrdersByUser = exports.getOrdersBySeller = exports.updateOrder = exports.createOrder = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const db_1 = __importDefault(require("../db/db"));
const orders_1 = require("../model/orders");
const seller_1 = require("../model/seller");
const user_1 = require("../model/user");
const product_1 = require("../model/product");
const create_order_dtos_1 = require("../dtos/create-order.dtos");
const orderRepository = db_1.default.getRepository(orders_1.Orders);
const sellerRepository = db_1.default.getRepository(seller_1.Seller);
const userRepository = db_1.default.getRepository(user_1.User);
const productRepository = db_1.default.getRepository(product_1.Product);
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = (0, class_transformer_1.plainToInstance)(create_order_dtos_1.CreateOrderDto, req.body);
        // console.log("orderData", orderData);
        const errors = yield (0, class_validator_1.validate)(orderData);
        if (errors.length > 0) {
            res.status(400).json({ success: false, errors });
            return;
        }
        const { shopName, userId, orderedItem } = orderData, orderDetails = __rest(orderData, ["shopName", "userId", "orderedItem"]);
        const seller = yield sellerRepository.findOneBy({ shopName });
        const user = yield userRepository.findOneBy({ id: userId });
        if (!seller || !user) {
            res.status(404).json({
                success: false,
                message: "Invalid seller or user information",
            });
            return;
        }
        yield db_1.default.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const productDetails = yield Promise.all(orderedItem.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const product = yield transactionalEntityManager
                    .getRepository(product_1.Product)
                    .createQueryBuilder("product")
                    .where("product.id = :id", { id: item.productId })
                    .setLock("pessimistic_write")
                    .getOne();
                if (!product || product.stock < item.quantity) {
                    throw new Error(`Product ${item.productId} is unavailable or out of stock`);
                    // res.status(500).json({
                    //   success: false,
                    //   message: `Product ${item.productId} is unavailable or out of stock`,
                    // });
                    // return;
                }
                product.stock -= item.quantity;
                yield transactionalEntityManager.save(product);
                return Object.assign(Object.assign({}, product), { orderQuantity: item.quantity });
            })));
            const newOrder = transactionalEntityManager.create(orders_1.Orders, Object.assign(Object.assign({}, orderDetails), { seller,
                user, orderedItems: orderedItem, status: "pending" }));
            yield transactionalEntityManager.save(newOrder);
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
                data: Object.assign(Object.assign({}, newOrder), { orderedItems: productDetails.map((product) => ({
                        productId: product.id,
                        title: product.title,
                        desc: product.desc,
                        price: product.price,
                        orderQuantity: product.orderQuantity,
                        remainingStock: product.stock,
                        productimage: product.productimage,
                    })) }),
            });
        }));
        return;
    }
    catch (error) {
        // console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
        return;
    }
});
exports.createOrder = createOrder;
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
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = Number(req.query.orderId);
        if (!req.query || !orderId) {
            res.status(404).json({
                success: false,
                message: "orderId is required",
            });
            return;
        }
        const order = yield orderRepository.findOneBy({ id: orderId });
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        const updateData = (0, class_transformer_1.plainToInstance)(create_order_dtos_1.UpdateOrderDto, req.body);
        const errors = yield (0, class_validator_1.validate)(updateData);
        if (errors.length > 0) {
            res.status(400).json({ success: false, errors });
            return;
        }
        order.status = updateData.status;
        yield orderRepository.save(order);
        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.updateOrder = updateOrder;
const getOrdersBySeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const shopName = (_a = req.query.shopName) === null || _a === void 0 ? void 0 : _a.toString();
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (!shopName) {
            res.status(400).json({
                success: false,
                message: "shopName is required",
            });
            return;
        }
        const sellerData = yield sellerRepository.findOneBy({ shopName });
        if (!sellerData) {
            res.status(404).json({
                success: false,
                message: "Seller not found",
            });
            return;
        }
        const [orders, totalOrders] = yield orderRepository.findAndCount({
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
        const productIds = Array.from(new Set(orders.flatMap((order) => order.orderedItems.map((item) => item.productId))));
        const products = yield productRepository.findByIds(productIds);
        const productMap = new Map(products.map((product) => [product.id, product]));
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
            return Object.assign(Object.assign({}, order), { orderedItems: orderedItemsWithDetails });
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});
exports.getOrdersBySeller = getOrdersBySeller;
const getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userData = yield userRepository.findOneBy({
            id: userId,
        });
        if (!userData) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const [orders, totalOrders] = yield orderRepository.findAndCount({
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
        const productIds = Array.from(new Set(orders.flatMap((order) => order.orderedItems.map((item) => item.productId))));
        const products = yield productRepository.findByIds(productIds);
        const productMap = new Map(products.map((product) => [product.id, product]));
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
            return Object.assign(Object.assign({}, order), { orderedItems: orderedItemsWithDetails });
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});
exports.getOrdersByUser = getOrdersByUser;
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
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = Number(req.query.orderId);
        if (!orderId) {
            res.status(400).json({
                success: false,
                message: "orderId is required",
            });
            return;
        }
        const order = yield orderRepository.findOne({
            where: { id: orderId },
            // relations: ["user"],
        });
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        const productIds = Array.from(new Set(order.orderedItems.map((item) => item.productId)));
        const products = yield productRepository.findByIds(productIds);
        const productMap = new Map(products.map((product) => [product.id, product]));
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
        const orderWithDetails = Object.assign(Object.assign({}, order), { orderedItems: orderedItemsWithDetails });
        res.status(200).json({
            success: true,
            message: "Order found successfully",
            data: orderWithDetails,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});
exports.getOrderById = getOrderById;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderId = Number(req.query.orderId);
        if (!req.query || !orderId) {
            res.status(404).json({
                success: false,
                message: "orderId is required",
            });
            return;
        }
        const order = yield orderRepository.findOneBy({ id: orderId });
        if (!order) {
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        yield orderRepository.remove(order);
        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        if (error.code) {
            switch (error.code) {
                case "23503":
                    res.status(400).json({
                        success: false,
                        message: "Product cannot be deleted as it is associated with other entities.",
                    });
                    break;
                default:
                    res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                    });
                    break;
            }
        }
        else {
            res.status(500).json({
                success: false,
                message: "An unexpected error occurred.",
            });
        }
    }
});
exports.deleteOrder = deleteOrder;
