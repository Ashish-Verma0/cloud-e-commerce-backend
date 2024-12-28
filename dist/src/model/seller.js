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
exports.Seller = void 0;
const typeorm_1 = require("typeorm");
const category_1 = require("./category");
const subCategory_1 = require("./subCategory");
const product_1 = require("./product");
const sellerLocation_1 = require("./sellerLocation");
const orders_1 = require("./orders");
let Seller = class Seller {
};
exports.Seller = Seller;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Seller.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Seller.prototype, "ownerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "ownerPassword", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], Seller.prototype, "ownerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "ownerAadhar", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "ownerPanCard", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "shopName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "shopLogo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Seller.prototype, "shopAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Seller.prototype, "shopVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Seller.prototype, "otpCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Seller.prototype, "otpExpiry", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_1.Category, (category) => category.seller),
    __metadata("design:type", Array)
], Seller.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subCategory_1.subCategory, (subCategory) => subCategory.seller),
    __metadata("design:type", Array)
], Seller.prototype, "subCategory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_1.Product, (product) => product.seller),
    __metadata("design:type", Array)
], Seller.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sellerLocation_1.SellerLocation, (sellerlocation) => sellerlocation.seller),
    __metadata("design:type", Array)
], Seller.prototype, "sellerLocation", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orders_1.Orders, (order) => order.seller),
    __metadata("design:type", Array)
], Seller.prototype, "orders", void 0);
exports.Seller = Seller = __decorate([
    (0, typeorm_1.Entity)()
], Seller);
