import { Router } from "express";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
import { validation } from "../../middlewares/validation.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.schema.js";
import express from "express";
const orderRouter = new Router();

// &cashOrder
orderRouter
  .route("/cashOrder")
  .post(
    isAuthenticated,
    isAuthorized("user"),
    validation(orderSchema.createOrder),
    catchError(orderController.cashOrder)
  );

// &paymentSession
orderRouter
  .route("/")
  .post(
    isAuthenticated,
    isAuthorized("user"),
    catchError(orderController.paymentSession)
  );

// &getOrder
orderRouter.get('/',
  isAuthenticated,
  isAuthorized("user"),
  catchError(orderController.getOrder)
);

// &webHook
// endPoind called by stripe
orderRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  catchError(orderController.createWebhook)
);

export default orderRouter;
