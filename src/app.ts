import express from "express";
import cors from "cors";
import userRoute from "./routes/user.routes";
import path from "path";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import sellerRoute from "./routes/seller.routes";
import categoryRoute from "./routes/category.routes";
import productRoute from "./routes/product..routes";
import subcategoryRoute from "./routes/subcategory.routes";
import sellerLocationRoute from "./routes/sellerLocation.routes";
import orderRoute from "./routes/order.routes";
import userLocationRoute from "./routes/userLocation.route";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/", apiLimiter);

app.use("/", express.static(path.join(__dirname, "../public/userImage")));
app.use("/", express.static(path.join(__dirname, "../public/shopLogo")));
app.use("/", express.static(path.join(__dirname, "../public/product")));
app.use("/", express.static(path.join(__dirname, "../public/category")));

app.use("/user", userRoute);
app.use("/seller", sellerRoute);
app.use("/category", categoryRoute);
app.use("/subcategory", subcategoryRoute);
app.use("/product", productRoute);
app.use("/sellerLocation", sellerLocationRoute);
app.use("/order", orderRoute);
app.use("/userLocation", userLocationRoute);

app.get("/", (req, res) => {
  res.send("hello");
});
// app.use("/api/products", productRoutes);
export default app;
