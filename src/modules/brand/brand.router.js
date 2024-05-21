import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import fileUpload, { fileValidation } from "../../middlewares/fileUpload.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as brandController from "./brand.controller.js";
import * as brandSchema from "./brand.schema.js";

const brandRouter = new Router();

// &addBrand
brandRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload({ filter: fileValidation.image }).single("image"),
    validation(brandSchema.addBrand),
    catchError(brandController.addBrand)
  )
  .get(validation(brandSchema.getBrand), catchError(brandController.getBrand));

// &updateBrand
brandRouter
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload({ filter: fileValidation.image }).single("image"),
    validation(brandSchema.updateBrand),
    catchError(brandController.updateBrand)
  )
  .delete(
    isAuthenticated,
    isAuthorized("admin"),
    validation(brandSchema.deleteBrand),
    catchError(brandController.deleteBrand)
  );

export default brandRouter;
