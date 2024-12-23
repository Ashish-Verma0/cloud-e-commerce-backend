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

  @Column({ type: "json" })
  categoryLogo?: Record<string, any>;

  @ManyToOne(() => Seller, (seller) => seller.categories)
  seller: Seller;

  @OneToMany(() => subCategory, (subCategory) => subCategory.category)
  subCategory: subCategory[];

  @OneToMany(() => Product, (product) => product.category)
  product: Product[];
}
