import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

//^ addReview
export const addReview = joi
  .object({
    comment: joi.string().min(3).max(200).required(),
    rating: joi.number().min(1).max(5).required(),
    productId: joi.string().custom(validationObjectID).required(),
  })
  .required();

//^ updateReview
export const updateReview = joi
  .object({
    comment: joi.string().min(3).max(200),
    rating: joi.number().min(1).max(5),
    productId: joi.string().custom(validationObjectID).required(),
  })
  .required();
