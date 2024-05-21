import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// *addBrand
export const addBrand = joi
  .object({
    title: joi.string().required().min(2).max(20).trim(),
    categories: joi
      .array()
      .items(joi.custom(validationObjectID).required())
      .required(),
    subcategories: joi
      .array()
      .items(joi.custom(validationObjectID).required())
      .required(),
  })
  .required();

// *updateBrand
export const updateBrand = joi
  .object({
    title: joi.string().min(2).max(20).trim(),
    id: joi.string().custom(validationObjectID).required(),
  })
  .required();

// *deleteBrand
export const deleteBrand = joi
  .object({
    id: joi.string().custom(validationObjectID).required(),
  })
  .required();

// *getBrand
export const getBrand = joi
  .object({
    category: joi.string().custom(validationObjectID),
    subcategory: joi.string().custom(validationObjectID),
  })
  .required();
