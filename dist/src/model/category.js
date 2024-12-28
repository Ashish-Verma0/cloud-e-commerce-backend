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
exports.Category = void 0;
const typeorm_1 = require("typeorm");
const seller_1 = require("./seller");
const subCategory_1 = require("./subCategory");
const product_1 = require("./product");
let Category = class Category {
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "categoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Object)
], Category.prototype, "categoryLogo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => seller_1.Seller, (seller) => seller.categories),
    __metadata("design:type", seller_1.Seller)
], Category.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subCategory_1.subCategory, (subCategory) => subCategory.category),
    __metadata("design:type", Array)
], Category.prototype, "subCategory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_1.Product, (product) => product.category),
    __metadata("design:type", Array)
], Category.prototype, "product", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)()
], Category);
