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

  @Column()
  subTotal: string;

  @Column({ default: "pending" })
  status: string;

  @Column()
  quantity: number;

  @ManyToOne(() => Seller, (seller) => seller.orders)
  seller: Seller;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Product, (product) => product.orders)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
