import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// *createOrder
export const createOrder = joi
  .object({
    shippingAddress: {
      city: joi.string().required(),
      address: joi.string().required(),
    },
    phone: joi.string().required(),
    payment: joi.string().valid("cash", "visa"),
  })
  .required();

// *cancelOrder
export const cancelOrder = joi
.object({
  orderId: joi.string().custom(validationObjectID).required(),
})
.required();