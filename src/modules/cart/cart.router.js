import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as cartSchema from "./cart.schema.js";
import * as cartController from "./cart.controller.js";
const cartRouter = new Router();

// &addToCart
cartRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.addToCart),
    catchError(cartController.addToCart)
  )
  //&updateCart
  .patch(
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.updateCart),
    catchError(cartController.updateCart)
  )
  //&getCart
  .get(
    isAuthenticated,
    isAuthorized("user", "admin"),
    validation(cartSchema.getCart),
    catchError(cartController.getCart)
  );
// &clearCart
cartRouter
  .route("/clearCart")
  .patch(
    isAuthenticated,
    isAuthorized("user"),
    catchError(cartController.clearCart)
  );
// &removeProduct
cartRouter
  .route("/:productId")
  .patch(
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.removeProduct),
    catchError(cartController.removeProduct)
  );
// &applyCoupon
cartRouter
  .route("/applyCoupon")
  .post(
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.applyCoupon),
    catchError(cartController.applyCoupon)
  );
export default cartRouter;
