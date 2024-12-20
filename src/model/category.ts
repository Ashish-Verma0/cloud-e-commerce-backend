import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Seller } from "./seller";
import { subCategory } from "./subCategory";
import { Product } from "./product";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryName: string;

  @Column()
  categoryLogo: string;

  @ManyToOne(() => Seller, (seller) => seller.categories)
  seller: Seller;

  @OneToMany(() => subCategory, (subCategory) => subCategory.categoryId)
  subCategory: subCategory[];

  @OneToMany(() => Product, (product) => product.categoryId)
  product: Product[];
}
