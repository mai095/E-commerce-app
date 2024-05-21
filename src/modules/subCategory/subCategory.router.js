import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as subcategoryController from "./subCategory.controller.js";
import * as subcategorySchema from "./subCategory.schema.js";

const subcategoryRouter = new Router({ mergeParams: true });

// &addsubcategory
subcategoryRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("admin"),

    validation(subcategorySchema.addsubcategory),
    catchError(subcategoryController.addsubcategory)
  )

  // &getSubcategory
  .get(
    validation(subcategorySchema.getSubcategory),
    catchError(subcategoryController.getSubcategory)
  );

// &updatesubcategory
subcategoryRouter
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized("admin"),
    validation(subcategorySchema.updatesubcategory),
    catchError(subcategoryController.updatesubcategory)
  )
  .delete(
    isAuthenticated,
    isAuthorized("admin"),
    validation(subcategorySchema.deletesubcategory),
    catchError(subcategoryController.deletesubcategory)
  );

export default subcategoryRouter;
