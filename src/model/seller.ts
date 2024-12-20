import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Category } from "./category";
import { subCategory } from "./subCategory";
import { Product } from "./product";

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerName: string;

  @Column({ unique: true })
  ownerEmail: string;

  @Column()
  ownerPassword: string;

  @Column()
  ownerPhone: number;

  @Column()
  ownerAadhar: string;

  @Column()
  ownerPanCard: string;

  @Column()
  shopName: string;

  @Column()
  shopLogo: string;

  @Column()
  shopAddress: string;

  @Column({ default: false })
  shopVerified: boolean;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ type: "timestamp", nullable: true })
  otpExpiry: Date;

  @OneToMany(() => Category, (category) => category.seller)
  categories: Category[];

  @OneToMany(() => subCategory, (subCategory) => subCategory.sellerId)
  subCategory: subCategory[];

  @OneToMany(() => Product, (product) => product.sellerId)
  product: Product[];
}
