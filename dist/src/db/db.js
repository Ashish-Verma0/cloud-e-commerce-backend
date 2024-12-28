"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("../model/user");
const product_1 = require("../model/product");
const seller_1 = require("../model/seller");
const category_1 = require("../model/category");
const subCategory_1 = require("../model/subCategory");
const contant_1 = require("../../contant");
const sellerLocation_1 = require("../model/sellerLocation");
const orders_1 = require("../model/orders");
const userLocation_1 = require("../model/userLocation");
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: contant_1.dbConfig.Hostname || "localhost",
    port: contant_1.dbConfig.Port || 5432,
    username: contant_1.dbConfig.Username || "postgres",
    password: contant_1.dbConfig.Password || "postgres",
    database: contant_1.dbConfig.Database || "test",
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
    dropSchema: true,
});
// const AppDataSource = new DataSource({
//   type: "postgres",
//   host: "localhost",
//   port: 5432,
//   username: "postgres",
//   password: "postgres",
//   database: "test",
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
// });
exports.default = AppDataSource;
