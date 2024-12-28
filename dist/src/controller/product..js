"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.sellerOutOfStockProduct = exports.createBulkProduct = exports.getProductById = exports.getAllProductsBySeller = exports.getAllProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const db_1 = __importDefault(require("../db/db"));
const product_1 = require("../model/product");
const seller_1 = require("../model/seller");
const category_1 = require("../model/category");
const subCategory_1 = require("../model/subCategory");
const class_transformer_1 = require("class-transformer");
const create_product_dtos_1 = require("../dtos/create-product.dtos");
const XLSX = __importStar(require("xlsx"));
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const productRepository = db_1.default.getRepository(product_1.Product);
const sellerRepository = db_1.default.getRepository(seller_1.Seller);
const categoryRepository = db_1.default.getRepository(category_1.Category);
const subcategoryRepository = db_1.default.getRepository(subCategory_1.subCategory);
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const productData = (0, class_transformer_1.plainToInstance)(create_product_dtos_1.CreateProductDto, req.body);
        if (req.body) {
            productData.stock = Number(req.body.stock);
            productData.rating = Number(req.body.rating);
            productData.price = Number(req.body.price);
        }
        if (req.files) {
            productData.productimage = req.files;
        }
        const errors = yield (0, class_validator_1.validate)(productData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({ shopName: shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "Seller not found",
            });
            return;
        }
        const category = yield categoryRepository.findOneBy({
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
            subcategory = yield subcategoryRepository.findOneBy({
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
        const alreadyExists = yield productRepository.find({
            where: { title: productData.title },
        });
        if ((alreadyExists === null || alreadyExists === void 0 ? void 0 : alreadyExists.length) > 0) {
            res.status(409).json({
                success: false,
                message: `Product Title Already Exists ${(_a = alreadyExists[0]) === null || _a === void 0 ? void 0 : _a.title}`,
            });
            return;
        }
        const product = yield productRepository.create(Object.assign(Object.assign({}, productData), { seller,
            category, subCategory: subcategory || null }));
        if (!product) {
            res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
            return;
        }
        yield productRepository.save(product);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = Number(req.query.productId);
        if (!req.query || isNaN(productId)) {
            res.status(404).json({
                success: false,
                message: "productId must be valid",
            });
            return;
        }
        const productData = (0, class_transformer_1.plainToInstance)(create_product_dtos_1.UpdateProductDto, req.body);
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
        const errors = yield (0, class_validator_1.validate)(productData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const product = yield productRepository.findOneBy({
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
        yield productRepository.save(product);
        res.status(200).json({
            success: true,
            message: "product updated successfully",
            data: product,
        });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "internal server error",
        });
        return;
    }
});
exports.updateProduct = updateProduct;
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
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = Number(req.query.productId);
        if (!req.query || isNaN(productId)) {
            res.status(404).json({
                success: false,
                message: "productId must be valid",
            });
            return;
        }
        const product = yield productRepository.findOneBy({ id: productId });
        if (!product) {
            res.status(404).json({
                success: false,
                message: "product not found",
            });
            return;
        }
        const deletedProduct = yield productRepository.delete(productId);
        res.status(200).json({
            success: true,
            message: "product deleted successfully",
            data: deletedProduct,
        });
        return;
    }
    catch (error) {
        console.log(error);
        if (error.code) {
            switch (error.code) {
                case "23503":
                    res.status(400).json({
                        success: false,
                        message: "Product cannot be deleted because it has associated with categories and subcategories.",
                    });
                    break;
                default:
                    res.status(500).json({
                        success: false,
                        message: "Internal server error.",
                    });
                    break;
            }
        }
        else {
            res.status(500).json({
                success: false,
                message: "An unexpected error occurred.",
            });
        }
    }
});
exports.deleteProduct = deleteProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
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
        const seller = yield sellerRepository.findOneBy({ shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const category = yield categoryRepository.findOneBy({ id: categoryId });
        if (!category) {
            res.status(404).json({
                success: false,
                message: "categoryId not found",
            });
            return;
        }
        let subCategory = null;
        if (subcategoryId && !isNaN(subcategoryId)) {
            subCategory = yield subcategoryRepository.findOneBy({
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
        const whereCondition = {
            seller: { shopName: seller.shopName },
            category: { id: category.id },
        };
        if (subCategory) {
            whereCondition.subCategory = { id: subCategory.id };
        }
        const totalProducts = yield productRepository.count({
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
        const allProducts = yield productRepository.find({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }
});
exports.getAllProducts = getAllProducts;
const getAllProductsBySeller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
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
        const seller = yield sellerRepository.findOneBy({ shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const whereCondition = {
            seller: { shopName: seller.shopName },
        };
        const totalProducts = yield productRepository.count({
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
        const allProducts = yield productRepository.find({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }
});
exports.getAllProductsBySeller = getAllProductsBySeller;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = Number(req.query.productId);
        if (!req.query || isNaN(productId)) {
            res.status(404).json({
                success: false,
                message: "productId is required",
            });
            return;
        }
        const productData = yield productRepository.find({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }
});
exports.getProductById = getProductById;
const createBulkProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queryRunner = db_1.default.createQueryRunner();
    try {
        yield queryRunner.connect();
        yield queryRunner.startTransaction();
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to read the Excel file",
                error: error.message,
            });
            return;
        }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        if (!rows || rows.length === 0) {
            res.status(400).json({
                success: false,
                message: "No valid data found in the Excel sheet",
            });
            return;
        }
        const errors = [];
        const addedProducts = [];
        let processedCount = 0;
        for (const row of rows) {
            try {
                const { shopName, categoryName, subcategoryName } = row, productData = __rest(row, ["shopName", "categoryName", "subcategoryName"]);
                row.isProductPopular = row.isProductPopular.replace(/"/g, "").trim();
                row.price = Number(row.price);
                row.stock = Number(row.stock);
                row.rating = row.rating ? Number(row.rating) : undefined;
                if (!shopName || !categoryName) {
                    throw new Error("shopName and categoryName must be provided");
                }
                const seller = yield queryRunner.manager.findOne(seller_1.Seller, {
                    where: { shopName },
                });
                if (!seller)
                    throw new Error(`Seller '${shopName}' not found`);
                const category = yield queryRunner.manager.findOne(category_1.Category, {
                    where: { categoryName },
                });
                if (!category)
                    throw new Error(`Category '${categoryName}' not found`);
                let subcategory = null;
                if (subcategoryName) {
                    subcategory = yield queryRunner.manager.findOne(subCategory_1.subCategory, {
                        where: { subcategoryName },
                    });
                    if (!subcategory) {
                        throw new Error(`Subcategory '${subcategoryName}' not found`);
                    }
                }
                const productDto = (0, class_transformer_1.plainToInstance)(create_product_dtos_1.CreateProductDto, productData);
                productDto.productimage = JSON.parse(row.productimage);
                const validationErrors = yield (0, class_validator_1.validate)(productDto);
                if (validationErrors.length > 0) {
                    const errorMessages = validationErrors
                        .map((err) => Object.values(err.constraints || {}).join(", "))
                        .join("; ");
                    throw new Error(`Validation failed: ${errorMessages}`);
                }
                const alreadyExists = yield productRepository.find({
                    where: { title: productDto.title },
                });
                if (alreadyExists) {
                    res.status(409).json({
                        success: false,
                        message: `Product Title Already Exists ${alreadyExists[0].title}`,
                    });
                    return;
                }
                const product = queryRunner.manager.create(product_1.Product, Object.assign(Object.assign({}, productDto), { seller,
                    category, subCategory: subcategory || null }));
                yield queryRunner.manager.save(product_1.Product, product);
                addedProducts.push(product);
            }
            catch (error) {
                errors.push({
                    row,
                    message: error.message,
                });
            }
            processedCount++;
        }
        yield queryRunner.commitTransaction();
        res.status(201).json({
            success: true,
            message: "Bulk product creation completed",
            addedProducts,
            errors,
            processedCount,
        });
    }
    catch (error) {
        yield queryRunner.rollbackTransaction();
        res.status(500).json({
            success: false,
            message: "Bulk product creation failed. All operations were rolled back.",
            error: error.message,
        });
    }
    finally {
        yield queryRunner.release();
    }
});
exports.createBulkProduct = createBulkProduct;
const sellerOutOfStockProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
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
        const seller = yield sellerRepository.findOneBy({ shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const whereCondition = {
            seller: { shopName: seller.shopName },
            stock: (0, typeorm_1.LessThan)(2), // Only products with stock less than 2
        };
        const totalProducts = yield productRepository.count({
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
        const allProducts = yield productRepository.find({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }
});
exports.sellerOutOfStockProduct = sellerOutOfStockProduct;
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopName, searchQuery, page = 1, resultPerPage = 10 } = req.query;
        if (!searchQuery) {
            res.status(400).json({
                success: false,
                message: "searchQuery is required",
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({
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
            .where(`product.title = :searchQuery
        OR product.desc = :searchQuery
      `, { searchQuery })
            .orWhere(`product.title ILIKE :partialQuery
        OR product.desc ILIKE :partialQuery
       `, { partialQuery: `%${searchQuery}%` });
        const totalProducts = yield query.getCount();
        if (!totalProducts) {
            res.status(404).json({
                success: false,
                message: "No products found",
            });
            return;
        }
        const skip = (Number(page) - 1) * Number(resultPerPage);
        const products = yield query
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
exports.searchProducts = searchProducts;
