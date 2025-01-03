import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Orders } from "./orders";
import { UserLocation } from "./userLocation";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column("simple-json", { nullable: true })
  avatar?: {
    filename: string;
    path: string;
    mimetype: string;
  };

  @ManyToOne(() => Orders, (order) => order.user)
  orders: Orders;

  @OneToMany(() => UserLocation, (userLocation) => userLocation.user)
  userLocation: UserLocation[];
}
