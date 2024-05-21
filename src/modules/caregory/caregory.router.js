import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import fileUpload, { fileValidation } from "../../middlewares/fileUpload.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as categoryController from "./category.controller.js";
import * as categorySchema from "./category.schema.js";
import subcategoryRouter from "../subCategory/subCategory.router.js";

const categoryRouter = new Router();
categoryRouter.use("/:category/subcategory", subcategoryRouter);

// &addCategory
categoryRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload({ filter: fileValidation.image }).single("categoryImage"),
    validation(categorySchema.addCategory),
    catchError(categoryController.addCategory)
  )
  
  // &getCategory
  .get(
    validation(categorySchema.getCategoryById),
    catchError(categoryController.getCategory)
  );

// &updateCategory
categoryRouter
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload({ filter: fileValidation.image }).single("categoryImage"),
    validation(categorySchema.updateCategory),
    catchError(categoryController.updateCategory)
  )
  .delete(
    isAuthenticated,
    isAuthorized("admin"),
    validation(categorySchema.deleteCategory),
    catchError(categoryController.deleteCategory)
  );

export default categoryRouter;
