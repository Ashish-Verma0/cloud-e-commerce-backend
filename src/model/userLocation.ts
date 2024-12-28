import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { SellerLocation } from "./sellerLocation";

@Entity()
export class UserLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  fullAddress: string;

  @Column()
  state: string;

  @Column()
  city: string;

  @Column()
  area: string;

  @Column()
  pinCode: string;

  @ManyToOne(() => User, (user) => user.userLocation)
  user: User;

  @OneToOne(() => SellerLocation)
  @JoinColumn() // This is important for a one-to-one relationship
  sellerLocation: SellerLocation;
}
