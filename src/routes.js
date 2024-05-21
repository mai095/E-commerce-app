import authRouter from "./modules/auth/auth.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import categoryRouter from "./modules/caregory/caregory.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import orderRouter from "./modules/order/order.router.js";
import productRouter from "./modules/product/product.router.js";
import reviewRouter from "./modules/review/review.router.js";
import subcategoryRouter from "./modules/subCategory/subCategory.router.js";
import wishlistRouter from "./modules/wishlist/wishlist.router.js";
import express from "express";

export const allRoutes = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/category", categoryRouter);
  app.use("/api/v1/subcategory", subcategoryRouter);
  app.use("/api/v1/brand", brandRouter);
  app.use("/api/v1/product", productRouter);
  app.use("/api/v1/coupon", couponRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/order", orderRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/review", reviewRouter);
};

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);
const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.

