import { DataSource } from "typeorm";
import { User } from "../model/user";
import { Product } from "../model/product";
import { Seller } from "../model/seller";
import { Category } from "../model/category";
import { subCategory } from "../model/subCategory";
import { dbConfig } from "../../contant";
import { SellerLocation } from "../model/sellerLocation";
import { Orders } from "../model/orders";
import { UserLocation } from "../model/userLocation";

const AppDataSource = new DataSource({
  type: "postgres",
  host: dbConfig.Hostname || "localhost",
  port: dbConfig.Port || 5432,
  username: dbConfig.Username || "postgres",
  password: dbConfig.Password || "postgres",
  database: dbConfig.Database || "test",
  entities: [
    User,
    Product,
    Seller,
    Category,
    subCategory,
    SellerLocation,
    Orders,
    UserLocation,
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

export default AppDataSource;
