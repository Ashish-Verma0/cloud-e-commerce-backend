import { DataSource } from "typeorm";
import { User } from "../model/user";
import { Product } from "../model/product";
import { Seller } from "../model/seller";
import { Category } from "../model/category";
import { subCategory } from "../model/subCategory";
import { dbConfig } from "../../contant";

const AppDataSource = new DataSource({
  type: "postgres",
  host: dbConfig.Hostname || "localhost",
  port: dbConfig.Port || 5432,
  username: dbConfig.Username || "postgres",
  password: dbConfig.Password || "postgres",
  database: dbConfig.Database || "test",
  entities: [User, Product, Seller, Category, subCategory],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
