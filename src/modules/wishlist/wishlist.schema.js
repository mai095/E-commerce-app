import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

export const getProductId = joi
  .object({
    productId: joi.string().custom(validationObjectID).required(),
  })
  .required();
