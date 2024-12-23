import { multer } from "multer";
import { Request, Response } from "express";
import AppDataSource from "../db/db";
import { subCategory } from "../model/subCategory";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateSubCategoryDto } from "../dtos/create-subcategory.dtos";
import { Seller } from "../model/seller";
import { Category } from "../model/category";

const subCategoryRepository = AppDataSource.getRepository(subCategory);
const sellerRepository = AppDataSource.getRepository(Seller);
const categoryRepository = AppDataSource.getRepository(Category);

interface QueryRequest extends Request {
  query: {
    subcategoryId?: string;
    categoryId?: string;
    sellerId?: string;
    shopName?: string;
    categoryName?: string;
  };
  file?: multer.File;
}

export const createSubcategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = Number(req.query.sellerId);
    const categoryId = Number(req.query.categoryId);

    if (!req.query || isNaN(sellerId) || isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        message: "Invalid or missing sellerId",
      });
      return;
    }

    const subcategoryData = plainToInstance(CreateSubCategoryDto, req.body);

    const errors = await validate(subcategoryData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({
      id: sellerId,
    });

    if (!seller) {
      res.status(404).json({
        success: true,
        message: "seller not found",
      });
      return;
    }

    const category = await categoryRepository.findOneBy({
      id: categoryId,
    });

    if (!category) {
      res.status(404).json({
        success: true,
        message: "category not found",
      });
      return;
    }

    if (req.file) {
      subcategoryData.subcategoryLogo = req.file;
    }

    const subcategory = await subCategoryRepository.create({
      ...subcategoryData,
      seller,
      category,
    });

    if (!subcategory) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
      return;
    }

    await subCategoryRepository.save(subcategory);

    res.status(201).json({
      success: true,
      message: "subcategory created successfully",
      subcategory,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const updateSubcategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const subcategoryId = Number(req.query.subcategoryId);

    if (!req.query || isNaN(subcategoryId)) {
      res.status(400).json({
        success: false,
        message: "Invalid or missing sellerId",
      });
      return;
    }

    const subcategoryData = plainToInstance(CreateSubCategoryDto, req.body);

    const errors = await validate(subcategoryData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const subcategory = await subCategoryRepository.findOneBy({
      id: subcategoryId,
    });

    if (!subcategory) {
      res.status(404).json({
        success: true,
        message: "seller not found",
      });
      return;
    }

    if (req.body.subcategoryName) {
      subcategory.subcategoryName = req.body.subcategoryName;
    }

    if (req.file) {
      subcategory.subcategoryLogo = req.file;
    }

    await subCategoryRepository.save(subcategory);

    res.status(201).json({
      success: true,
      message: "subcategory created successfully",
      subcategory,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const deletesubcategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const subcategoryId = Number(req.query.subcategoryId);

    if (!req.query || isNaN(subcategoryId)) {
      res.status(400).json({
        success: false,
        message: "Invalid or missing sellerId",
      });
      return;
    }

    const subcategory = await subCategoryRepository.findOneBy({
      id: subcategoryId,
    });

    if (!subcategory) {
      res.status(404).json({
        success: false,
        message: "subcategoryId not found",
      });
      return;
    }

    await subCategoryRepository.delete(subcategoryId);

    res.status(200).json({
      success: true,
      message: "subcategoryId deleted successfully",
      data: subcategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getAllSubCategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName;
    const categoryName = req.query.categoryName;
    if (!req.query || !shopName || !categoryName) {
      res.status(404).json({
        success: false,
        message: "sellerId is required",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({
      shopName,
    });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const category = await categoryRepository.findOneBy({
      categoryName,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "category not found",
      });
      return;
    }

    const subcategorydata = await subCategoryRepository.find({
      where: { category: { categoryName }, seller: { shopName } },
      // relations: ["category", "seller"],
    });

    if (!subcategorydata) {
      res.status(404).json({
        success: false,
        message: "subcategory not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "sub category found successfully",
      data: subcategorydata,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
    return;
  }
};
