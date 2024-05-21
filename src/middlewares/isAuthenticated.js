import { tokenModel } from "../../DB/models/token.model.js";
import userModel from "../../DB/models/user.model.js";
import catchError from "./catchError.js";
import jwt from "jsonwebtoken";

const isAuthenticated = catchError(async (req, res, next) => {
  //check token
  let { token } = req.headers;
  if (!token) return next(new Error("Token is required", { cause: 400 }));

  //check bearer key
  if (!token.startsWith(process.env.BEARER_KEY))
    return next(new Error("Invalid token", { cause: 400 }));

  //decode token
  token = token.split(process.env.BEARER_KEY)[1];
  const payload = jwt.verify(token, process.env.SECRET_KEY);
  //check valid token
  const tokenDB = await tokenModel.findOne({ token, isValid: true });
  if (!tokenDB)
    return next(new Error("Invalid Token, try to login again", { cause: 400 }));

  //check user
  const user = await userModel.findById(payload._id);
  if (!user) return next(new Error("User not found", { cause: 404 }));

  //send userData to req
  req.userData = user;
  return next();
});

export default isAuthenticated;
