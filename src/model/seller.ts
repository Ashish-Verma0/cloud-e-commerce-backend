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
import { SellerLocation } from "./sellerLocation";
import { Orders } from "./orders";

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

  @Column({ type: "varchar", length: 10 })
  ownerPhone: string;

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

  @Column({ type: "boolean", default: false })
  shopVerified: boolean;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ type: "timestamp", nullable: true })
  otpExpiry: Date;

  @OneToMany(() => Category, (category) => category.seller)
  categories: Category[];

  @OneToMany(() => subCategory, (subCategory) => subCategory.seller)
  subCategory: subCategory[];

  @OneToMany(() => Product, (product) => product.seller)
  product: Product[];

  @OneToMany(() => SellerLocation, (sellerlocation) => sellerlocation.seller)
  sellerLocation: SellerLocation[];

  @OneToMany(() => Orders, (order) => order.seller)
  orders: Orders[];
}
