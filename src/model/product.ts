import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category";
import { subCategory } from "./subCategory";
import { Seller } from "./seller";

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
  rating: number;

  @Column()
  category: string;

  @Column()
  subcategory: string;

  @Column()
  stock: number;

  @Column("simple-array")
  productimage: string[];

  @Column()
  isProductPopular: string;

  @Column("simple-json", { nullable: true })
  customerReview: { user: string; review: string }[];

  @ManyToOne(() => Category, (category) => category.product)
  categoryId: Category;

  @ManyToOne(() => subCategory, (subcategory) => subcategory.product)
  subCategoryId: subCategory;

  @ManyToOne(() => Seller, (seller) => seller.product)
  sellerId: Seller;
}
