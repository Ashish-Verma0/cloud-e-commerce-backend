import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./user";
import { Product } from "./product";
import { Seller } from "./seller";

@Entity()
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("json")
  address: {
    name: string;
    phoneNumber: string;
    fullAddress: string;
    state: string;
    city: string;
    area: string;
    pinCode: string;
  };

  @Column()
  transactionId: string;

  // @ManyToOne(() => Product, (product) => product.orders)
  // product: Product;

  // @Column()
  // quantity: number;

  @Column("json")
  orderedItems: {
    productId: number;
    quantity: number;
  }[];

  @Column()
  subTotal: string;

  @Column()
  deliveryPrice: number;

  @Column({ default: "pending" })
  status: string;

  @ManyToOne(() => Seller, (seller) => seller.orders)
  seller: Seller;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
