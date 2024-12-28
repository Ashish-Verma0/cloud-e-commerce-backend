"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const seller_routes_1 = __importDefault(require("./routes/seller.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product__routes_1 = __importDefault(require("./routes/product..routes"));
const subcategory_routes_1 = __importDefault(require("./routes/subcategory.routes"));
const sellerLocation_routes_1 = __importDefault(require("./routes/sellerLocation.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const userLocation_route_1 = __importDefault(require("./routes/userLocation.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use("/api/", apiLimiter);
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../public/userImage")));
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../public/shopLogo")));
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../public/product")));
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../public/category")));
app.use("/user", user_routes_1.default);
app.use("/seller", seller_routes_1.default);
app.use("/category", category_routes_1.default);
app.use("/subcategory", subcategory_routes_1.default);
app.use("/product", product__routes_1.default);
app.use("/sellerLocation", sellerLocation_routes_1.default);
app.use("/order", order_routes_1.default);
app.use("/userLocation", userLocation_route_1.default);
app.get("/", (req, res) => {
    res.send("hello");
});
// app.use("/api/products", productRoutes);
exports.default = app;
