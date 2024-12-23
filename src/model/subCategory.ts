import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category";
import { Seller } from "./seller";
import { Product } from "./product";

@Entity()
export class subCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subcategoryName: string;

  @Column({ type: "json" })
  subcategoryLogo?: Record<string, any>;

  @ManyToOne(() => Category, (Category) => Category.subCategory)
  category: Category;

  @ManyToOne(() => Seller, (seller) => seller.subCategory)
  seller: Seller;

  @OneToMany(() => Product, (product) => product.subCategory)
  product: Product[];
}
