import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSubCategoryDto {
  @IsNotEmpty()
  @IsString()
  subcategoryName: string;

  @IsOptional()
  subcategoryLogo?: any;
}

export class updateSubCategoryDto {
  @IsOptional()
  @IsString()
  subcategoryName: string;

  @IsOptional()
  subcategoryLogo?: any;
}
