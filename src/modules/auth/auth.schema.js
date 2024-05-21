import joi from "joi";
import { validationObjectID } from "../../middlewares/validation.js";

// ^register
const register = joi
  .object({
    userName: joi.string().min(3).max(10).trim().required(),
    email: joi
      .string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    password: joi
      .string()
      .required()
      .min(5)
      .max(15)
      .pattern(new RegExp("[A-Za-z0-9]{5,8}")),
    confirmPassword: joi.string().required().valid(joi.ref("password")),
    age: joi.number().required().min(18).max(99).message({
      "number.min": "Age must be between 18 and 99",
      "number.max": "Age must be between 18 and 99",
    }),
    gender: joi.string(),
    role: joi.string().valid("user", "seller", "admin"),
    phone: joi.string().required(),
  })
  .required();

// ^activation
const activation = joi
  .object({
    token: joi.string().required(),
  })
  .required();

// ^logIn
const logIn = joi
  .object({
    email: joi
      .string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    password: joi
      .string()
      .required()
      .min(5)
      .max(15)
      .pattern(new RegExp("[A-Za-z0-9]{5,8}")),
  })
  .required();

// ^forgetCode
const forgetCode = joi
  .object({
    email: joi
      .string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  })
  .required();

// ^resetPassword
const resetPassword = joi
  .object({
    email: joi
      .string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    forgetCode: joi.string().required(),
    password: joi
      .string()
      .required()
      .min(5)
      .max(15)
      .pattern(new RegExp("[A-Za-z0-9]{5,8}")),
    confirmPassword: joi.string().required().valid(joi.ref("password")),
  })
  .required();

// ^changePass
const changePass = joi
  .object({
    oldPassword: joi
      .string()
      .required()
      .min(5)
      .max(15)
      .pattern(new RegExp("[A-Za-z0-9]{5,8}")),

    newPassword: joi
      .string()
      .required()
      .min(5)
      .max(15)
      .pattern(new RegExp("[A-Za-z0-9]{5,8}")),
    confirmPassword: joi.string().required().valid(joi.ref("newPassword")),
  })
  .required();

// ^userId
const userId = joi
  .object({
    userId: joi.string().custom(validationObjectID),
  })
  .required();

// ^updateAccount
const updateAccount = joi
  .object({
    userId: joi.string().custom(validationObjectID),
    userName: joi.string().min(3).max(10).trim(),
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),

    age: joi.number().min(18).max(99).message({
      "number.min": "Age must be between 18 and 99",
      "number.max": "Age must be between 18 and 99",
    }),
    gender: joi.string(),
    phone: joi.string(),
  })
  .required();

export {
  register,
  activation,
  logIn,
  forgetCode,
  resetPassword,
  userId,
  changePass,
  updateAccount,
};
