"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSellerSubCategory = exports.getAllSubCategory = exports.deletesubcategory = exports.updateSubcategory = exports.createSubcategory = void 0;
const db_1 = __importDefault(require("../db/db"));
const subCategory_1 = require("../model/subCategory");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_subcategory_dtos_1 = require("../dtos/create-subcategory.dtos");
const seller_1 = require("../model/seller");
const category_1 = require("../model/category");
const subCategoryRepository = db_1.default.getRepository(subCategory_1.subCategory);
const sellerRepository = db_1.default.getRepository(seller_1.Seller);
const categoryRepository = db_1.default.getRepository(category_1.Category);
const createSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
        const categoryName = req.query.categoryName;
        if (!req.query || !shopName || !categoryName) {
            res.status(400).json({
                success: false,
                message: "Invalid or missing shopName",
            });
            return;
        }
        const subcategoryData = (0, class_transformer_1.plainToInstance)(create_subcategory_dtos_1.CreateSubCategoryDto, req.body);
        const errors = yield (0, class_validator_1.validate)(subcategoryData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({
            shopName,
        });
        if (!seller) {
            res.status(404).json({
                success: true,
                message: "seller not found",
            });
            return;
        }
        const category = yield categoryRepository.findOneBy({
            categoryName,
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
        const subcategory = yield subCategoryRepository.create(Object.assign(Object.assign({}, subcategoryData), { seller,
            category }));
        if (!subcategory) {
            res.status(500).json({
                success: false,
                message: "something went wrong",
            });
            return;
        }
        yield subCategoryRepository.save(subcategory);
        res.status(201).json({
            success: true,
            message: "subcategory created successfully",
            subcategory,
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
exports.createSubcategory = createSubcategory;
const updateSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subcategoryId = Number(req.query.subcategoryId);
        // console.log("req.query", req.query);
        if (!req.query || isNaN(subcategoryId)) {
            res.status(400).json({
                success: false,
                message: "Invalid or missing subcategoryId",
            });
            return;
        }
        const subcategoryData = (0, class_transformer_1.plainToInstance)(create_subcategory_dtos_1.updateSubCategoryDto, req.body);
        const errors = yield (0, class_validator_1.validate)(subcategoryData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const subcategory = yield subCategoryRepository.findOneBy({
            id: subcategoryId,
        });
        // console.log("subcategory", subcategory);
        if (!subcategory) {
            res.status(404).json({
                success: true,
                message: "subcategory not found",
            });
            return;
        }
        if (req.body.subcategoryName) {
            subcategory.subcategoryName = req.body.subcategoryName;
        }
        if (req.file) {
            subcategory.subcategoryLogo = req.file;
        }
        yield subCategoryRepository.save(subcategory);
        res.status(200).json({
            success: true,
            message: "subcategory updated successfully",
            subcategory,
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
exports.updateSubcategory = updateSubcategory;
const deletesubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subcategoryId = Number(req.query.subcategoryId);
        if (!req.query || isNaN(subcategoryId)) {
            res.status(400).json({
                success: false,
                message: "Invalid or missing subcategoryId",
            });
            return;
        }
        const subcategory = yield subCategoryRepository.findOneBy({
            id: subcategoryId,
        });
        if (!subcategory) {
            res.status(404).json({
                success: false,
                message: "subcategory not found",
            });
            return;
        }
        yield subCategoryRepository.delete(subcategoryId);
        res.status(200).json({
            success: true,
            message: "subcategoryId deleted successfully",
            data: subcategory,
        });
    }
    catch (error) {
        console.error(error);
        if (error.code) {
            switch (error.code) {
                case "23503":
                    res.status(400).json({
                        success: false,
                        message: "Subcategory cannot be deleted as it is associated with other entities.",
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
exports.deletesubcategory = deletesubcategory;
const getAllSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
        const categoryName = req.query.categoryName;
        if (!req.query || !shopName || !categoryName) {
            res.status(404).json({
                success: false,
                message: "shopName is required",
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({
            shopName,
        });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "seller not found",
            });
            return;
        }
        const category = yield categoryRepository.findOneBy({
            categoryName,
        });
        if (!category) {
            res.status(404).json({
                success: false,
                message: "category not found",
            });
            return;
        }
        const subcategorydata = yield subCategoryRepository.find({
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
exports.getAllSubCategory = getAllSubCategory;
const getAllSellerSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopName, page = 1, limit = 10 } = req.query;
        console.log(req.query);
        if (!shopName) {
            res.status(400).json({
                success: false,
                message: "shopName is required",
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({
            shopName,
        });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "Seller not found",
            });
            return;
        }
        const [subcategorydata, totalCategories] = yield subCategoryRepository.findAndCount({
            where: { seller: { shopName } },
            relations: ["category"],
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });
        if (!subcategorydata.length) {
            res.status(404).json({
                success: false,
                message: "Subcategories not found",
            });
            return;
        }
        const totalPages = Math.ceil(totalCategories / Number(limit));
        res.status(200).json({
            success: true,
            message: "Subcategories found successfully",
            data: {
                subcategory: subcategorydata,
                pagination: {
                    totalCategories,
                    totalPages,
                    currentPage: Number(page),
                    resultPerPage: Number(limit),
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
exports.getAllSellerSubCategory = getAllSellerSubCategory;
