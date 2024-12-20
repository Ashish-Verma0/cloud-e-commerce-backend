import { DataSource } from "typeorm";
import { User } from "../model/user";
import { Product } from "../model/product";
import { Seller } from "../model/seller";
import { Category } from "../model/category";
import { subCategory } from "../model/subCategory";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "test",
  entities: [User, Product, Seller, Category, subCategory],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
