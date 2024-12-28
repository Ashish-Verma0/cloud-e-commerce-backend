import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Seller } from "./seller";

@Entity()
export class SellerLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  state: string;

  @Column()
  city: string;

  @Column()
  area: string;

  @Column()
  deliveryTime: string;

  @Column()
  deliveryPrice: string;

  @Column()
  pinCode: string;

  @ManyToOne(() => Seller, (seller) => seller.sellerLocation)
  seller: Seller;
}
