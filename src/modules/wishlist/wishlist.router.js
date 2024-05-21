import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as wishlistController from "./wishlist.controller.js";
import * as wishlistSchema from "./wishlist.schema.js";

const wishlistRouter = new Router();

// &addToWishlist
wishlistRouter
  .route("/")
  .patch(
    isAuthenticated,
    isAuthorized("user"),
    validation(wishlistSchema.getProductId),
    catchError(wishlistController.addToWishlist)
  )
  //&getWishlist
  .get(
    isAuthenticated,
    isAuthorized("user"),
    catchError(wishlistController.getWishlist)
  );

//&removeFromWishlist
wishlistRouter
  .route("/removeItem")
  .patch(
    isAuthenticated,
    isAuthorized("user"),
    validation(wishlistSchema.getProductId),
    catchError(wishlistController.removeFromWishlist)
  );
export default wishlistRouter;
