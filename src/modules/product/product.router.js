import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import fileUpload, { fileValidation } from "../../middlewares/fileUpload.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as productController from "./product.controller.js";
import * as productSchema from "./product.schema.js";
import reviewRouter from "../review/review.router.js";

const productRouter = new Router();

productRouter.use("/:productId/review", reviewRouter);

// *addProduct
productRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("seller"),
    fileUpload({ filter: fileValidation.image }).fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 3 },
    ]),
    validation(productSchema.addProduct),
    catchError(productController.addProduct)
  )
  // *getProduct
  .get(catchError(productController.getProduct));

// *updateProduct
productRouter
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized("seller"),
    fileUpload({ filter: fileValidation.image }).fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 3 },
    ]),
    validation(productSchema.updateProduct),
    catchError(productController.updateProduct)
  )

  // *deleteProduct
  .delete(
    isAuthenticated,
    isAuthorized("seller"),
    validation(productSchema.deleteProduct),
    catchError(productController.deleteProduct)
  );

export default productRouter;
