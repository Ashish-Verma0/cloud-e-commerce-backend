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
import { validate } from "class-validator";

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

    const product = await productRepository.create({
      ...productData,
      seller,
      category,
      subCategory: subcategory || null, // Handle null subcategory
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
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
    return;
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
        message: "shopName not found",
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

    // Count total products for pagination
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
      // relations: ["seller", "category", "subCategory"], // Uncomment if relations are needed
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
        message: "shopName and categoryId must be valid",
      });
      return;
    }

    const seller = await sellerRepository.findOneBy({ shopName });

    if (!seller) {
      res.status(404).json({
        success: false,
        message: "shopName not found",
      });
      return;
    }

    const whereCondition: any = {
      seller: { shopName: seller.shopName },
    };

    // Count total products for pagination
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
      relations: ["category", "subCategory"], // Uncomment if relations are needed
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

    const productData = await productRepository.findOneBy({ id: productId });

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
