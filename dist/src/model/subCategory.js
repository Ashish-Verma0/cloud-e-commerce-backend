"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subCategory = void 0;
const typeorm_1 = require("typeorm");
const category_1 = require("./category");
const seller_1 = require("./seller");
const product_1 = require("./product");
let subCategory = class subCategory {
};
exports.subCategory = subCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], subCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], subCategory.prototype, "subcategoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], subCategory.prototype, "subcategoryLogo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_1.Category, (Category) => Category.subCategory),
    __metadata("design:type", category_1.Category)
], subCategory.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => seller_1.Seller, (seller) => seller.subCategory),
    __metadata("design:type", seller_1.Seller)
], subCategory.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_1.Product, (product) => product.subCategory),
    __metadata("design:type", Array)
], subCategory.prototype, "product", void 0);
exports.subCategory = subCategory = __decorate([
    (0, typeorm_1.Entity)()
], subCategory);
