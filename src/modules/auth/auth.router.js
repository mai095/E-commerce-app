import { Router } from "express";
import fileUpload, { fileValidation } from "../../middlewares/fileUpload.js";
import { validation } from "../../middlewares/validation.js";
import * as authSchema from "./auth.schema.js";
import * as authController from "./auth.controller.js";
import catchError from "../../middlewares/catchError.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import isAuthorized from "../../middlewares/isAuthorized.js";
const authRouter = new Router();

// *register
authRouter.post(
  "/register",
  validation(authSchema.register),
  catchError(authController.register)
);

// *logIn
authRouter.post(
  "/login",
  validation(authSchema.logIn),
  catchError(authController.logIn)
);

// *activation
authRouter.get(
  "/activation/:token",
  validation(authSchema.activation),
  catchError(authController.activation)
);

// *forgetCode
authRouter.patch(
  "/forgetCode",
  validation(authSchema.forgetCode),
  catchError(authController.forgetCode)
);

// *resetPassword
authRouter.patch(
  "/resetPassword",
  validation(authSchema.resetPassword),
  catchError(authController.resetPassword)
);

// *changePass
authRouter.patch(
  "/changePass",
  isAuthenticated,
  validation(authSchema.changePass),
  catchError(authController.changePass)
);
// *deleteUser
authRouter.put(
  "/",
  isAuthenticated,
  isAuthorized("user", "admin"),
  validation(authSchema.userId),
  catchError(authController.deleteUser)
);

// *getUserData
authRouter.get(
  "/:userId",
  isAuthenticated,
  isAuthorized("user", "admin"),
  validation(authSchema.userId),
  catchError(authController.getUserData)
);

// *updateAccount
authRouter.patch(
  "/:userId",
  isAuthenticated,
  isAuthorized("user"),
  validation(authSchema.updateAccount),
  catchError(authController.updateAccount)
);
export default authRouter;
