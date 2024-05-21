import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as couponSchema from "./coupon.schema.js";
import * as couponController from "./coupon.controller.js";

const couponRouter = new Router();

//&createCoupon
couponRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("seller"),
    validation(couponSchema.createCoupon),
    catchError(couponController.createCoupon)
  )
  //&getCoupon
  .get(
    isAuthenticated,
    isAuthorized("seller", "admin"),
    catchError(couponController.getCoupon)
  );

//&updateCoupon
couponRouter
  .route("/:id")
  .patch(
    isAuthenticated,
    isAuthorized("seller"),
    validation(couponSchema.updateCoupon),
    catchError(couponController.updateCoupon)
  )

  //&deleteCoupon
  .delete(
    isAuthenticated,
    isAuthorized("seller"),
    validation(couponSchema.deleteCoupon),
    catchError(couponController.deleteCoupon)
  );

export default couponRouter;
