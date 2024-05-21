import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// ^createCoupon
export const createCoupon = joi
  .object({
    discount: joi.number().integer().required().min(1).max(100),
    expiredAt: joi.date().greater(Date.now()).required(),
  })
  .required();

//^updateCoupon
export const updateCoupon = joi
  .object({
    discount: joi.number().integer().min(1).max(100),
    expiredAt: joi.date().greater(Date.now()),
    id: joi.string().custom(validationObjectID).required(),
  })
  .required();

//^deleteCoupon
export const deleteCoupon = joi
  .object({
    id: joi.string().custom(validationObjectID).required(),
  })
  .required();
