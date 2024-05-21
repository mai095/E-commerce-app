import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// ^addToCart
export const addToCart = joi
  .object({
    productId: joi.string().custom(validationObjectID).required(),
    quantity: joi.number().integer().min(1).required(),
    coupon: joi.string().custom(validationObjectID),
  })
  .required();

// ^updateCart
export const updateCart = joi
  .object({
    productId: joi.string().custom(validationObjectID).required(),
    quantity: joi.number().integer().min(1),
  })
  .required();

// ^getCart
export const getCart = joi
  .object({
    cartId: joi.string().custom(validationObjectID),
  })
  .required();

//  ^removeProduct
export const removeProduct = joi
  .object({
    productId: joi.string().custom(validationObjectID).required(),
  })
  .required();

// ^applyCoupon
export const applyCoupon = joi
  .object({
    coupon: joi.string().custom(validationObjectID),
  })
  .required();
