import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

class ProductImageDto {
  @IsString()
  fieldname: string;

  @IsString()
  originalname: string;

  @IsString()
  encoding: string;

  @IsString()
  mimetype: string;

  @IsString()
  destination: string;

  @IsString()
  filename: string;

  @IsString()
  path: string;

  @IsNumber()
  size: number;
}

class CustomerReviewDto {
  @IsString()
  user: string;

  @IsString()
  review: string;
}

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  productimage: ProductImageDto[];

  @IsString()
  isProductPopular: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerReviewDto)
  customerReview?: CustomerReviewDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  productimage?: ProductImageDto[];

  @IsOptional()
  @IsString()
  isProductPopular?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerReviewDto)
  customerReview?: CustomerReviewDto[];
}
