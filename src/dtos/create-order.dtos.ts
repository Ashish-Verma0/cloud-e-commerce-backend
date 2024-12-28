// import {
//   IsNotEmpty,
//   IsString,
//   IsNumber,
//   IsIn,
//   ValidateNested,
// } from "class-validator";
// import { Type } from "class-transformer";

// class AddressDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   phoneNumber: string;

//   @IsNotEmpty()
//   @IsString()
//   fullAddress: string;

//   @IsNotEmpty()
//   @IsString()
//   state: string;

//   @IsNotEmpty()
//   @IsString()
//   city: string;

//   @IsNotEmpty()
//   @IsString()
//   area: string;

//   @IsNotEmpty()
//   @IsString()
//   pinCode: string;
// }

// export class CreateOrderDto {
//   @ValidateNested()
//   @Type(() => AddressDto)
//   address: AddressDto;

//   @IsNotEmpty()
//   @IsString()
//   transactionId: string;

//   @IsNotEmpty()
//   @IsString()
//   subTotal: string;

//   @IsNotEmpty()
//   @IsNumber()
//   quantity: number;

//   @IsNotEmpty()
//   @IsString()
//   shopName: string;

//   @IsNotEmpty()
//   @IsNumber()
//   userId: number;

//   @IsNotEmpty()
//   @IsNumber()
//   productId: number;
// }

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateNested,
  ArrayNotEmpty,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";

class AddressDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  fullAddress: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsNotEmpty()
  @IsString()
  pinCode: string;
}

class OrderedItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderedItemDto)
  orderedItem: OrderedItemDto[];

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsString()
  subTotal: string;

  @IsNotEmpty()
  @IsNumber()
  deliveryPrice: number;

  @IsNotEmpty()
  @IsString()
  shopName: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}

export class UpdateOrderDto {
  @IsIn(["pending", "delivered", "cancelled"])
  @IsNotEmpty()
  @IsString()
  status: string;
}
