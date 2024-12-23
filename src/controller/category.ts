// import { Category } from './../model/category';
import { multer } from "multer";
import { Request, Response } from "express";
import AppDataSource from "../db/db";

import { Category } from "../model/category";
import { plainToInstance } from "class-transformer";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../dtos/create-category.dtos";
import { validate } from "class-validator";
import { Seller } from "../model/seller";
import { subCategory } from "../model/subCategory";

const categoryRepository = AppDataSource.getRepository(Category);
const subcategoryRepository = AppDataSource.getRepository(subCategory);
const sellerRepository = AppDataSource.getRepository(Seller);

interface QueryRequest extends Request {
  query: {
    categoryId?: string;
    sellerId?: string;
    shopName?: string;
    page?: string;
    limit?: string;
  };
  file?: multer.File;
  seller?: {
    id: number;
  };
}

export const createCategory = async (req: QueryRequest, res: Response) => {
  try {
    const sellerId = Number(req.query.sellerId);

    if (!req.query || isNaN(sellerId)) {
      res.status(404).json({
        success: false,
        message: "sellerId not found",
      });
      return;
    }

    const categoryData = plainToInstance(CreateCategoryDto, req.body);

    const errors = await validate(categoryData);

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
        success: false,
        message: "seller not found",
      });
      return;
    }

    if (req.file) {
      categoryData.categoryLogo = req.file;
    }
    const category = await categoryRepository.create({
      ...categoryData,
      seller,
    });

    if (!category) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
      return;
    }

    await categoryRepository.save(category);

    res.status(201).json({
      success: true,
      message: "category created successfully",
      category,
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = Number(req.query.categoryId);
    // console.log("ashish", categoryId);
    if (!req.query || isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
      return;
    }

    const updateCategoryData = plainToInstance(UpdateCategoryDto, req.body);

    const errors = await validate(updateCategoryData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const category = await categoryRepository.findOne({
      where: { id: categoryId },
    });
    // console.log("category", category);
    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    if (updateCategoryData.categoryName) {
      category.categoryName = updateCategoryData.categoryName;
    }

    if (req.file?.filename) {
      category.categoryLogo = req.file;
    }

    await categoryRepository.save(category);
    // console.log("category1", category);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const deleteCategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const categoryId = Number(req.query.categoryId);

    if (!req.query || isNaN(categoryId)) {
      res.status(400).json({
        success: false,
        message: "Category ID is required and must be a number.",
      });
      return;
    }

    console.log("Category ID received:", categoryId);

    const category = await categoryRepository.findOne({
      where: { id: categoryId },
      relations: ["seller"],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    const subcategories = await subcategoryRepository.find({
      where: { category: { id: categoryId } },
    });

    if (subcategories.length > 0) {
      res.status(400).json({
        success: false,
        message:
          "Category cannot be deleted because it has associated subcategories.",
      });
      return;
    }

    const sellerId = req.seller?.id;
    console.log("sellerId", sellerId);
    if (category.seller.id !== sellerId) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to delete this category.",
      });
      return;
    }

    await categoryRepository.delete(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
    return;
  } catch (error: any) {
    console.error("Error deleting category:", error);

    if (error.code) {
      switch (error.code) {
        case "23503":
          res.status(400).json({
            success: false,
            message:
              "Category cannot be deleted as it is associated with other entities.",
          });
          break;
        default:
          res.status(500).json({
            success: false,
            message: "Internal server error.",
          });
          break;
      }
    } else {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred.",
      });
    }
  }
};

export const getAllCategory = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    if (!shopName) {
      res.status(400).json({
        success: false,
        message: "Invalid or missing shopName.",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "Shop name not found.",
      });
      return;
    }

    const [categories, totalCategories] = await categoryRepository.findAndCount(
      {
        where: { seller: { shopName } },
        skip: offset,
        take: limit,
      }
    );

    if (!categories || categories.length === 0) {
      res.status(404).json({
        success: false,
        message: "No categories found for the given shop name.",
      });
      return;
    }

    const totalPages = Math.ceil(totalCategories / limit);

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
      pagination: {
        totalCategories,
        totalPages,
        currentPage: page,
        resultPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
