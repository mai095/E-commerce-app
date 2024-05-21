import joi from "joi";

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
