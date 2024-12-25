import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSellerLocationDto {
  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  area: string;

  @IsString()
  deliveryTime?: string;

  @IsString()
  deliveryPrice: string;

  @IsString()
  pinCode: string;
}

export class UpdateSellerLocationDto {
  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  deliveryPrice: string;

  @IsOptional()
  @IsString()
  pinCode: string;
}
