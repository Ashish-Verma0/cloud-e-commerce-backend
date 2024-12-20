import { IsNotEmpty, IsString, IsBoolean, IsNumber } from "class-validator";

export class CreateSellerDTO {
  @IsNotEmpty()
  @IsString()
  ownerName: string;

  @IsNotEmpty()
  @IsString()
  ownerEmail: string;

  @IsNotEmpty()
  @IsString()
  ownerPassword: string;

  @IsNotEmpty()
  @IsNumber()
  ownerPhone: string;

  @IsNotEmpty()
  @IsString()
  ownerAadhar: string;

  @IsNotEmpty()
  @IsString()
  ownerPanCard: string;

  @IsNotEmpty()
  @IsString()
  shopName: string;

  @IsNotEmpty()
  @IsString()
  shopLogo: string;

  @IsNotEmpty()
  @IsString()
  shopAddress: string;

  @IsBoolean()
  shopVerified: string;
}

export class LoginSellerDTO {
  @IsNotEmpty()
  @IsString()
  ownerEmail: string;

  @IsNotEmpty()
  @IsString()
  ownerPassword: string;
}
