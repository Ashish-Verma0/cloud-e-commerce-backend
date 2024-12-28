import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category";
import { subCategory } from "./subCategory";
import { Seller } from "./seller";
import { Orders } from "./orders";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  desc: string;

  @Column("decimal")
  price: number;

  @Column("float")
  rating?: number;

  @Column()
  stock: number;

  @Column("simple-json")
  productimage: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path?: string;
    size: number;
  }[];

  @Column()
  isProductPopular?: string;

  @Column("simple-json", { nullable: true })
  customerReview?: { user: string; review: string }[];

  @ManyToOne(() => Category, (category) => category.product)
  category: Category;

  @ManyToOne(() => subCategory, (subcategory) => subcategory.product)
  subCategory: subCategory;

  @ManyToOne(() => Seller, (seller) => seller.product)
  seller: Seller;

  // @OneToMany(() => Orders, (order) => order.product)
  // orders: Orders;
}
