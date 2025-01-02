import { multer } from "multer";
import { Request, Response } from "express";
import AppDataSource from "../db/db";
import { Product } from "../model/product";
import { Seller } from "../model/seller";
import { Category } from "../model/category";
import { subCategory } from "../model/subCategory";
import { plainToInstance } from "class-transformer";
import {
  CreateProductDto,
  UpdateProductDto,
} from "../dtos/create-product.dtos";
import * as XLSX from "xlsx";
import { validate } from "class-validator";
import { LessThan } from "typeorm";

const productRepository = AppDataSource.getRepository(Product);
const sellerRepository = AppDataSource.getRepository(Seller);
const categoryRepository = AppDataSource.getRepository(Category);
const subcategoryRepository = AppDataSource.getRepository(subCategory);

interface QueryRequest extends Request {
  query: {
    categoryId?: string;
    categoryName?: string;
    subcategoryName?: string;
    sellerId?: string;
    subcategoryId: string;
    productId: string;
    shopName: string;
    resultPerPage: string;
    page: string;
  };
  files?: multer.File;
  file?: multer.File;
}

interface ProductRow {
  shopName: string;
  categoryName: string;
  subcategoryName?: string;
  [key: string]: any;
}

export const createProduct = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName;
    const categoryName = req.query.categoryName;
    const subcategoryName = req.query.subcategoryName;

    if (!req.query || !shopName || !categoryName) {
      res.status(404).json({
        success: false,
        message: "shopName and categoryName must be valid",
      });
      return;
    }

    const productData = plainToInstance(CreateProductDto, req.body);

    if (req.body) {
      productData.stock = Number(req.body.stock);
      productData.rating = Number(req.body.rating);
      productData.price = Number(req.body.price);
    }
    if (req.files) {
      productData.productimage = req.files;
    }

    const errors = await validate(productData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName: shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "Seller not found",
      });
      return;
    }

    const category = await categoryRepository.findOneBy({
      categoryName: categoryName,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    let subcategory = null;

    if (subcategoryName) {
      subcategory = await subcategoryRepository.findOneBy({
        subcategoryName: subcategoryName,
      });

      if (!subcategory) {
        res.status(404).json({
          success: false,
          message: "Subcategory not found",
        });
        return;
      }
    }

    const alreadyExists = await productRepository.find({
      where: { title: productData.title },
    });

    if (alreadyExists?.length > 0) {
      res.status(409).json({
        success: false,
        message: `Product Title Already Exists ${alreadyExists[0]?.title}`,
      });
      return;
    }

    const product = await productRepository.create({
      ...productData,
      seller,
      category,
      subCategory: subcategory || null,
    });

    if (!product) {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
      return;
    }

    await productRepository.save(product);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
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

export const updateProduct = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const productId = Number(req.query.productId);

    if (!req.query || isNaN(productId)) {
      res.status(404).json({
        success: false,
        message: "productId must be valid",
      });
      return;
    }

    const productData = plainToInstance(UpdateProductDto, req.body);
    if (req.body.stock) {
      productData.stock = Number(req.body.stock);
    }
    if (req.body.price) {
      productData.price = Number(req.body.price);
    }

    if (req.body.rating) {
      productData.rating = Number(req.body.rating);
    }

    if (req.files.length > 0) {
      productData.productimage = req.files;
    }
    const errors = await validate(productData);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const product = await productRepository.findOneBy({
      id: productId,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "product not found",
      });
      return;
    }

    if (req.files.length > 0) {
      product.productimage = productData.productimage;
    }

    product.stock = productData.stock;
    product.price = productData.price;
    product.rating = productData.rating;
    product.title = productData.title;
    product.desc = productData.desc;
    product.isProductPopular = productData.isProductPopular;

    await productRepository.save(product);

    res.status(200).json({
      success: true,
      message: "product updated successfully",
      data: product,
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

// export const getAllProducts = async (
//   req: QueryRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const shopName = req.query.shopName;
//     const categoryId = Number(req.query.categoryId);
//     const subcategoryId = Number(req.query.subcategoryId);

//     if (!req.query || !shopName || isNaN(categoryId) || isNaN(subcategoryId)) {
//       res.status(404).json({
//         success: false,
//         message: "shopName,categoryId,subCategoryId must valid",
//       });
//       return;
//     }

//     const seller = await sellerRepository.findOneBy({ shopName: shopName });

//     if (!seller) {
//       res.status(404).json({
//         success: false,
//         message: "shopName not found",
//       });
//       return;
//     }
//     const category = await categoryRepository.findOneBy({ id: categoryId });

//     if (!category) {
//       res.status(404).json({
//         success: false,
//         message: "sellerid not found",
//       });
//       return;
//     }
//     const subCategory = await subcategoryRepository.findOneBy({
//       id: subcategoryId,
//     });

//     if (!subCategory) {
//       res.status(404).json({
//         success: false,
//         message: "sellerid not found",
//       });
//       return;
//     }

//     const allProducts = await productRepository.find({
//       where: {
//         seller: { shopName: seller.shopName },
//         category: { id: category.id },
//         subCategory: { id: subCategory.id },
//       },
//       relations: ["seller", "category", "subCategory"],
//     });

//     if (!allProducts) {
//       res.status(404).json({
//         success: false,
//         message: "No Data Found",
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       message: "products found successfully",
//       data: allProducts,
//     });
//     return;
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "internal server error",
//     });
//     return;
//   }
// };

export const deleteProduct = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const productId = Number(req.query.productId);

    if (!req.query || isNaN(productId)) {
      res.status(404).json({
        success: false,
        message: "productId must be valid",
      });
      return;
    }

    const product = await productRepository.findOneBy({ id: productId });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "product not found",
      });
      return;
    }

    const deletedProduct = await productRepository.delete(productId);

    res.status(200).json({
      success: true,
      message: "product deleted successfully",
      data: deletedProduct,
    });
    return;
  } catch (error) {
    console.log(error);
    if (error.code) {
      switch (error.code) {
        case "23503":
          res.status(400).json({
            success: false,
            message:
              "Product cannot be deleted because it has associated with categories and subcategories.",
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

export const getAllProducts = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName as string;
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : null;
    const subcategoryId = req.query.subcategoryId
      ? Number(req.query.subcategoryId)
      : null;
    const resultPerPage = req.query.resultPerPage
      ? Number(req.query.resultPerPage)
      : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    if (!req.query || !shopName || !categoryId || isNaN(categoryId)) {
      res.status(404).json({
        success: false,
        message: "shopName and categoryId must be valid",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const category = await categoryRepository.findOneBy({ id: categoryId });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "categoryId not found",
      });
      return;
    }

    let subCategory = null;
    if (subcategoryId && !isNaN(subcategoryId)) {
      subCategory = await subcategoryRepository.findOneBy({
        id: subcategoryId,
      });
      if (!subCategory) {
        res.status(404).json({
          success: false,
          message: "subcategoryId not found",
        });
        return;
      }
    }

    const whereCondition: any = {
      seller: { shopName: seller.shopName },
      category: { id: category.id },
    };

    if (subCategory) {
      whereCondition.subCategory = { id: subCategory.id };
    }

    const totalProducts = await productRepository.count({
      where: whereCondition,
    });

    if (!totalProducts) {
      res.status(404).json({
        success: false,
        message: "No Data Found",
      });
      return;
    }

    const totalPages = Math.ceil(totalProducts / resultPerPage);
    const skip = (page - 1) * resultPerPage;

    const allProducts = await productRepository.find({
      where: whereCondition,
      skip,
      take: resultPerPage,
      relations: ["category"],
    });

    res.status(200).json({
      success: true,
      message: "Products found successfully",
      data: {
        products: allProducts,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          resultPerPage,
        },
      },
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

export const getAllProductsBySeller = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName as string;

    const resultPerPage = req.query.resultPerPage
      ? Number(req.query.resultPerPage)
      : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    if (!req.query || !shopName) {
      res.status(404).json({
        success: false,
        message: "shopName must be valid",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const whereCondition: any = {
      seller: { shopName: seller.shopName },
    };

    const totalProducts = await productRepository.count({
      where: whereCondition,
    });

    if (!totalProducts) {
      res.status(404).json({
        success: false,
        message: "No Data Found",
      });
      return;
    }

    const totalPages = Math.ceil(totalProducts / resultPerPage);
    const skip = (page - 1) * resultPerPage;

    const allProducts = await productRepository.find({
      where: whereCondition,
      skip,
      take: resultPerPage,
      relations: ["category", "subCategory"],
    });

    res.status(200).json({
      success: true,
      message: "Products found successfully",
      data: {
        products: allProducts,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          resultPerPage,
        },
      },
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

export const getProductById = async (req, res) => {
  try {
    const productId = Number(req.query.productId);

    if (!req.query || isNaN(productId)) {
      res.status(404).json({
        success: false,
        message: "productId is required",
      });
      return;
    }

    const productData = await productRepository.find({
      where: { id: productId },
      relations: ["category"],
    });

    if (!productData) {
      res.status(404).json({
        success: false,
        message: "product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "product details found successfully",
      data: productData,
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

export const createBulkProduct = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
      return;
    }
    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to read the Excel file",
        error: error.message,
      });
      return;
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: ProductRow[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid data found in the Excel sheet",
      });
      return;
    }

    const errors: any[] = [];
    const addedProducts: any[] = [];
    let processedCount = 0;

    for (const row of rows) {
      try {
        const { shopName, categoryName, subcategoryName, ...productData } = row;

        row.isProductPopular = row.isProductPopular.replace(/"/g, "").trim();
        row.price = Number(row.price);
        row.stock = Number(row.stock);
        row.rating = row.rating ? Number(row.rating) : undefined;
        if (!shopName || !categoryName) {
          throw new Error("shopName and categoryName must be provided");
        }

        const seller = await queryRunner.manager.findOne(Seller, {
          where: { shopName },
        });
        if (!seller) throw new Error(`Seller '${shopName}' not found`);

        const category = await queryRunner.manager.findOne(Category, {
          where: { categoryName },
        });
        if (!category) throw new Error(`Category '${categoryName}' not found`);

        let subcategory = null;
        if (subcategoryName) {
          subcategory = await queryRunner.manager.findOne(subCategory, {
            where: { subcategoryName },
          });
          if (!subcategory) {
            throw new Error(`Subcategory '${subcategoryName}' not found`);
          }
        }

        const productDto = plainToInstance(CreateProductDto, productData);
        productDto.productimage = JSON.parse(row.productimage);

        const validationErrors = await validate(productDto);

        if (validationErrors.length > 0) {
          const errorMessages = validationErrors
            .map((err) => Object.values(err.constraints || {}).join(", "))
            .join("; ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }

        const alreadyExists = await productRepository.find({
          where: { title: productDto?.title },
        });

        if (alreadyExists?.length > 0) {
          res.status(409).json({
            success: false,
            message: `Product Title Already Exists ${alreadyExists[0]?.title}`,
          });
          return;
        }

        const product = queryRunner.manager.create(Product, {
          ...productDto,
          seller,
          category,
          subCategory: subcategory || null,
        });

        await queryRunner.manager.save(Product, product);
        addedProducts.push(product);
      } catch (error) {
        errors.push({
          row,
          message: error.message,
        });
      }

      processedCount++;
    }

    await queryRunner.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Bulk product creation completed",
      addedProducts,
      errors,
      processedCount,
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();

    res.status(500).json({
      success: false,
      message: "Bulk product creation failed. All operations were rolled back.",
      error: error.message,
    });
  } finally {
    await queryRunner.release();
  }
};

export const sellerOutOfStockProduct = async (
  req: QueryRequest,
  res: Response
): Promise<void> => {
  try {
    const shopName = req.query.shopName as string;

    const resultPerPage = req.query.resultPerPage
      ? Number(req.query.resultPerPage)
      : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    if (!req.query || !shopName) {
      res.status(404).json({
        success: false,
        message: "shopName must be valid",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const whereCondition: any = {
      seller: { shopName: seller.shopName },
      stock: LessThan(2), // Only products with stock less than 2
    };

    const totalProducts = await productRepository.count({
      where: whereCondition,
    });

    if (!totalProducts) {
      res.status(404).json({
        success: false,
        message: "No Data Found",
      });
      return;
    }

    const totalPages = Math.ceil(totalProducts / resultPerPage);
    const skip = (page - 1) * resultPerPage;

    const allProducts = await productRepository.find({
      where: whereCondition,
      skip,
      take: resultPerPage,
      relations: ["category", "subCategory"],
    });

    res.status(200).json({
      success: true,
      message: "Products found successfully",
      data: {
        products: allProducts,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          resultPerPage,
        },
      },
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

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shopName, searchQuery, page = 1, resultPerPage = 10 } = req.query;

    if (!searchQuery) {
      res.status(400).json({
        success: false,
        message: "searchQuery is required",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({
      shopName: shopName.toString(),
    });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "seller not found",
      });
      return;
    }

    const query = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory")
      .leftJoinAndSelect("product.seller", "seller")
      .where(
        `product.title = :searchQuery
        OR product.desc = :searchQuery
      `,
        { searchQuery }
      )
      .orWhere(
        `product.title ILIKE :partialQuery
        OR product.desc ILIKE :partialQuery
       `,
        { partialQuery: `%${searchQuery}%` }
      );

    const totalProducts = await query.getCount();

    if (!totalProducts) {
      res.status(404).json({
        success: false,
        message: "No products found",
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(resultPerPage);
    const products = await query
      .skip(skip)
      .take(Number(resultPerPage))
      .getMany();

    const totalPages = Math.ceil(totalProducts / Number(resultPerPage));

    res.status(200).json({
      success: true,
      message: "Products found successfully",
      data: {
        products,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: Number(page),
          resultPerPage: Number(resultPerPage),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
