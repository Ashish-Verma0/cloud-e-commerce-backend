import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
} from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  categoryName: string;

  @IsOptional()
  categoryLogo?: any;

  // @IsNotEmpty()
  // //   @IsNumber()
  // @IsString()
  // sellerId: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  categoryLogo?: any;

  @IsOptional()
  @IsNumber()
  sellerId?: number;
}
