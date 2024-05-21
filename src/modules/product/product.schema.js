import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// *addProduct
export const addProduct = joi
  .object({
    title: joi.string().min(2).max(20).required().trim(),
    description: joi.string().min(2).max(300).required(),
    price: joi.number().min(0).required(),
    discount: joi.number().integer().min(0),
    category: joi.string().custom(validationObjectID).required(),
    subcategory: joi.string().custom(validationObjectID).required(),
    brand: joi.string().custom(validationObjectID).required(),
    quantity:joi.number().integer().required()
})
  .required();

  // *updateProduct
  export const updateProduct = joi
  .object({
    id:joi.string().custom(validationObjectID).required(),
    title: joi.string().min(2).max(20).trim(),
    description: joi.string().min(2).max(300),
    price: joi.number().min(0),
    discount: joi.number().integer().min(0),
    quantity:joi.number().integer()
})
  .required();

  // *deleteProduct
  export const deleteProduct = joi
  .object({
    id:joi.string().custom(validationObjectID).required(),
})
  .required();
