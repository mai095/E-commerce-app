import jwt from "jsonwebtoken";
import userModel from "../../../DB/models/user.model.js";
import { resetPassTemp, signUpTemp } from "../../utiltis/htmlTempletes.js";
import sendEmail from "../../utiltis/sendEmail.js";
import bcrypt from "bcryptjs";
import { tokenModel } from "../../../DB/models/token.model.js";
import randomstring from "randomstring";
import { cartModel } from "../../../DB/models/cart.model.js";

// ^register
const register = async (req, res, next) => {
  //check email
  const isExist = await userModel.findOne({ email: req.body.email });
  if (isExist) return next(new Error("Email already exist", { cause: 400 }));

  //check confirm password
  if (req.body.password !== req.body.confirmPassword)
    return next(new Error("Confirm password is not matched", { cause: 409 }));

  //create user
  const user = await userModel.create({ ...req.body });

  //create token in DB
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.SECRET_KEY
  );

  //activation
  const html = signUpTemp(
    `http://localhost:3000/api/v1/auth/activation/${token}`
  );
  const confirmMsg = await sendEmail({
    to: user.email,
    subject: "Account Activation",
    html,
  });
  if (!confirmMsg) return next(new Error("Invalid Email", { cause: 404 }));

  //create cart
  await cartModel.create({ user: user._id });
  //res
  return res.json({ success: true, message: "Check you email for activation" });
};

// ^activation
const activation = async (req, res, next) => {
  //check token
  const token = req.params.token;
  if (!token) return next(new Error("Invalid URL", { cause: 404 }));
  //decode token
  const payload = jwt.verify(token, process.env.SECRET_KEY);
  //update user
  const user = await userModel.findOneAndUpdate(
    { email: payload.email },
    { isConfirmed: true },
    { new: true }
  );
  await user.save();
  //res
  user && res.json({ success: true, message: "You can login now" });
  !user &&
    res.json({
      success: false,
      message: next(new Error("User not found", { cause: 404 })),
    });
};

// ^logIn
const logIn = async (req, res, next) => {
console.log(req.originalUrl);

  //check email in Db
  const user = await userModel.findOne({
    email: req.body.email,
  });
  if (!user)
    return next(
      new Error("Email not found,try to signUp first!", { cause: 409 })
    );

  //check blocked
  if (user.isBlocked == true)
    return next(new Error("Your account is blocked by admin", { cause: 409 }));

  //check password
  if (!bcrypt.compareSync(req.body.password, user.password))
    return next(new Error("Wrong password", { cause: 400 }));

  //check confirmation
  if (!user.isConfirmed)
    return next(new Error("Confirm you email first", { cause: 403 }));

  //create token in Db
  const token = jwt.sign(
    { email: user.email, _id: user._id },
    process.env.SECRET_KEY
  );
  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["agent"],
  });
  //res
  return res.json({ success: true, token });
};

// ^forgetCode
const forgetCode = async (req, res, next) => {
  //check email
  const user = await userModel.findOne({
    email: req.body.email,
  });
  if (!user)
    return next(
      new Error("Email not found,try to signUp first!", { cause: 403 })
    );
  //check confirmation
  if (!user.isConfirmed)
    return next(new Error("Confirm your email first", { cause: 403 }));

  //generate code
  const forgetCode = randomstring.generate({ length: 5, charset: "numeric" });
  user.forgetCode = forgetCode;
  await user.save();
  //send email
  const html = resetPassTemp(forgetCode);
  const emailMsg = await sendEmail({
    to: user.email,
    subject: "Forget Code",
    html,
  });
  if (!emailMsg) return next(new Error("Something went wrong!"));

  //res
  return res.json({ success: true, message: "Check your email" });
};

// ^resetPassword
const resetPassword = async (req, res, next) => {
  //check email
  const user = await userModel.findOne({
    email: req.body.email,
  });

  if (!user)
    return next(
      new Error("Email not found,try to signUp first!", { cause: 409 })
    );

  //check forgetCode
  if (user.forgetCode !== req.body.forgetCode)
    return next(new Error("Invalid code", { cause: 400 }));

  await userModel.findByIdAndUpdate(
    user._id,
    { $unset: { forgetCode: 1 } },
    { new: true }
  );

  user.password = req.body.password;
  await user.save();

  //logOut
  await tokenModel.findOneAndUpdate(
    { user: user._id },
    { isValid: false },
    { new: true }
  );

  return res.json({ success: true, message: "Try to login with new password" });
};

// ^deleteUser
const deleteUser = async (req, res, next) => {
  if (req.userData.role === "user") {
    const tokens = await tokenModel.find({ user: req.userData._id });
    tokens.forEach(async (token) => {
      token.isValid = false;
      await token.save();
    });
    if (!tokens)
      return next(
        new Error("Not allowed to delete this account", { cause: 403 })
      );
    return res.json({ success: true, message: "Account deleted successfully" });

    //admin
  } else {
    if (!req.query.userId)
      return next(new Error("UserId is required!", { cause: 400 }));
    const user = await userModel.findById(req.query.userId);
    if (!user) return next(new Error("User not found", { cause: 404 }));
    const tokens = await tokenModel.find({ user });
    tokens.forEach(async (token) => {
      token.isValid = false;
      await token.save();
    });
    user.isBlocked = true;
    await user.save();
    return res.json({ success: true, message: "Account deleted successfully" });
  }
};

// ^changePass
const changePass = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await userModel.findById(req.userData._id);
  if (!bcrypt.compareSync(oldPassword, user.password))
    return next(
      new Error("Wrong Password,you not allowed to change password", {
        cause: 400,
      })
    );

  if (confirmPassword !== newPassword)
    return next(new Error("Wrong confirmPassword!", { cause: 400 }));

  user.password = req.body.newPassword;
  await user.save();

  // logOut
  const tokens = await tokenModel.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  return res.json({
    succes: true,
    message: "Your password is updated,try to logIn with new password",
  });
};

// ^get
const getUserData = async (req, res, next) => {
  // check user
  const user = await userModel.findById(req.params.userId);
  if (!user) return next(new Error("User not Found", { cause: 404 }));

  if (req.userData.role == "admin") {
    // get data
    const results = await userModel.findById(user._id);
    return res.json({
      success: true,
      results,
    });
  } else {
    //check owner
    if (user._id.toString() !== req.userData._id.toString())
      return next(
        new Error("Not allowed to get data of this account", { cause: 403 })
      );

    // get data
    const results = await userModel.findById(user._id);
    return res.json({
      success: true,
      results,
    });
  }
};

// ^update account
const updateAccount = async (req, res, next) => {
  // check user
  const user = await userModel.findById(req.params.userId);
  if (!user) return next(new Error("User not Found", { cause: 404 }));

  //check owner
  if (user._id.toString() !== req.userData._id.toString())
    return next(
      new Error("Not allowed to update this account", { cause: 403 })
    );

  //check email
  if (req.body.email)
    return next(new Error("Not allowed to change your email", { cause: 400 }));

  //update
  await userModel.findByIdAndUpdate(user._id, { ...req.body }, { new: true });

  //logout
  const tokens = await tokenModel.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  //res
  return res.json({
    success: true,
    message: "User updated successfully!, try to login again",
  });
};

// *export
export {
  activation,
  logIn,
  register,
  forgetCode,
  resetPassword,
  deleteUser,
  changePass,
  updateAccount,
  getUserData,
};
