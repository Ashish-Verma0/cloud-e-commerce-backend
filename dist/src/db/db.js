"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("../model/user");
const product_1 = require("../model/product");
const seller_1 = require("../model/seller");
const category_1 = require("../model/category");
const subCategory_1 = require("../model/subCategory");
const sellerLocation_1 = require("../model/sellerLocation");
const orders_1 = require("../model/orders");
const userLocation_1 = require("../model/userLocation");
// const AppDataSource = new DataSource({
//   type: "postgres",
//   host: dbConfig.Hostname || "localhost",
//   port: dbConfig.Port || 5432,
//   username: dbConfig.Username || "postgres",
//   password: dbConfig.Password || "postgres",
//   database: dbConfig.Database || "test",
//   entities: [
//     User,
//     Product,
//     Seller,
//     Category,
//     subCategory,
//     SellerLocation,
//     Orders,
//     UserLocation,
//   ],
//   synchronize: true,
//   logging: false,
//   dropSchema: true,
// });
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "test",
    entities: [
        user_1.User,
        product_1.Product,
        seller_1.Seller,
        category_1.Category,
        subCategory_1.subCategory,
        sellerLocation_1.SellerLocation,
        orders_1.Orders,
        userLocation_1.UserLocation,
    ],
    synchronize: true,
    logging: false,
});
exports.default = AppDataSource;
