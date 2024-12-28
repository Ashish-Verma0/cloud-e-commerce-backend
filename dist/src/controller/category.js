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
exports.getAllCategory = exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const db_1 = __importDefault(require("../db/db"));
const category_1 = require("../model/category");
const class_transformer_1 = require("class-transformer");
const create_category_dtos_1 = require("../dtos/create-category.dtos");
const class_validator_1 = require("class-validator");
const seller_1 = require("../model/seller");
const subCategory_1 = require("../model/subCategory");
const categoryRepository = db_1.default.getRepository(category_1.Category);
const subcategoryRepository = db_1.default.getRepository(subCategory_1.subCategory);
const sellerRepository = db_1.default.getRepository(seller_1.Seller);
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = Number(req.query.sellerId);
        if (!req.query || isNaN(sellerId)) {
            res.status(404).json({
                success: false,
                message: "sellerId not found",
            });
            return;
        }
        const categoryData = (0, class_transformer_1.plainToInstance)(create_category_dtos_1.CreateCategoryDto, req.body);
        const errors = yield (0, class_validator_1.validate)(categoryData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({
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
        const category = yield categoryRepository.create(Object.assign(Object.assign({}, categoryData), { seller }));
        if (!category) {
            res.status(500).json({
                success: false,
                message: "something went wrong",
            });
            return;
        }
        yield categoryRepository.save(category);
        res.status(201).json({
            success: true,
            message: "category created successfully",
            category,
        });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const updateCategoryData = (0, class_transformer_1.plainToInstance)(create_category_dtos_1.UpdateCategoryDto, req.body);
        const errors = yield (0, class_validator_1.validate)(updateCategoryData);
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
            return;
        }
        const category = yield categoryRepository.findOne({
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
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) {
            category.categoryLogo = req.file;
        }
        yield categoryRepository.save(category);
        // console.log("category1", category);
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
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
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const category = yield categoryRepository.findOne({
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
        const subcategories = yield subcategoryRepository.find({
            where: { category: { id: categoryId } },
        });
        if (subcategories.length > 0) {
            res.status(400).json({
                success: false,
                message: "Category cannot be deleted because it has associated subcategories.",
            });
            return;
        }
        const sellerId = (_a = req.seller) === null || _a === void 0 ? void 0 : _a.id;
        console.log("sellerId", sellerId);
        if (category.seller.id !== sellerId) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to delete this category.",
            });
            return;
        }
        yield categoryRepository.delete(categoryId);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
        });
        return;
    }
    catch (error) {
        console.error("Error deleting category:", error);
        if (error.code) {
            switch (error.code) {
                case "23503":
                    res.status(400).json({
                        success: false,
                        message: "Category cannot be deleted as it is associated with other entities.",
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
exports.deleteCategory = deleteCategory;
const getAllCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shopName = req.query.shopName;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        if (!shopName) {
            res.status(400).json({
                success: false,
                message: "Invalid or missing shopName.",
            });
            return;
        }
        const seller = yield sellerRepository.findOneBy({ shopName });
        if (!seller) {
            res.status(404).json({
                success: false,
                message: "seller not found.",
            });
            return;
        }
        const [categories, totalCategories] = yield categoryRepository.findAndCount({
            where: { seller: { shopName } },
            skip: offset,
            take: limit,
        });
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
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
exports.getAllCategory = getAllCategory;
