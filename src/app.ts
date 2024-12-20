import express from "express";
import cors from "cors";
import userRoute from "./routes/user.routes";
import path from "path";
import cookieParser from "cookie-parser";
import sellerRoute from "./routes/seller.routes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "../public/userImage")));
app.use("/", express.static(path.join(__dirname, "../public/shopLogo")));
app.use("/user", userRoute);
app.use("/seller", sellerRoute);

app.get("/", (req, res) => {
  res.send("hello");
});
// app.use("/api/products", productRoutes);
export default app;
