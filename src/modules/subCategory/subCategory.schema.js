import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// *addsubcategory
export const addsubcategory = joi
  .object({
    title: joi.string().required().min(2).max(20),
    category: joi.string().custom(validationObjectID).required(),
  })
  .required();

// *updatesubcategory
export const updatesubcategory = joi
  .object({
    title: joi.string().min(2).max(20),
    id: joi.string().custom(validationObjectID).required(),
    category: joi.string().custom(validationObjectID).required(),
  })
  .required();

// *deletesubcategory
export const deletesubcategory = joi
  .object({
    id: joi.string().custom(validationObjectID).required(),
    category: joi.string().custom(validationObjectID).required(),
  })
  .required();

// *getSubcategory
export const getSubcategory = joi
  .object({
    id: joi.string().custom(validationObjectID),
    category: joi.string().custom(validationObjectID)
  })
  .required();
