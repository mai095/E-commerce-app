import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// *addCategory
export const addCategory = joi
  .object({
    title: joi.string().required().min(2).max(20),
  })
  .required();

// *updateCategory
export const updateCategory = joi
  .object({
    title: joi.string().min(2).max(20),
    id: joi.string().custom(validationObjectID).required(),
  })
  .required();

// *deleteCategory
export const deleteCategory = joi
  .object({
    id: joi.string().custom(validationObjectID).required(),
  })
  .required();

  // *getCategoryById
  export const getCategoryById = joi
  .object({
    id: joi.string().custom(validationObjectID),
  })
  .required();
