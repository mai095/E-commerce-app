import { Types } from "mongoose";


export function validation(schema) {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    const validationResults = schema.validate(data, { abortEarly: false });
    if (validationResults.error) {
      const errorMsg = validationResults.error.details.map((messObj) => {
        return messObj.message;
      });
      return next(new Error(errorMsg));
    } else {
      next();
    }
  };
}
export const validationObjectID = (value, helper) => {
  if (Types.ObjectId.isValid(value)) return true;
  return helper.message("Invalid objectId", 400);
};
