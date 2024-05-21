import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as reviewController from "./review.controller.js";
import * as reviewSchema from "./review.schema.js";

const reviewRouter = Router({ mergeParams: true });

// &addReview
reviewRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("user"),
    validation(reviewSchema.addReview),
    catchError(reviewController.addReview)
  )
  // &updateReview
  .patch(
    isAuthenticated,
    isAuthorized("user"),
    validation(reviewSchema.updateReview),
    catchError(reviewController.updateReview)
  );

export default reviewRouter;
