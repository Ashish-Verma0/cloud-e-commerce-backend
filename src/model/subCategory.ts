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

  @Column()
  subcategoryLogo: string;

  @ManyToOne(() => Category, (Category) => Category.subCategory)
  categoryId: Category;

  @ManyToOne(() => Seller, (seller) => seller.subCategory)
  sellerId: Seller;

  @OneToMany(() => Product, (product) => product.subCategoryId)
  product: Product[];
}
