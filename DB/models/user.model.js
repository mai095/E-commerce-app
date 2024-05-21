import bcrypt from "bcryptjs";
import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minLength: [3, "userName is too short"],
      maxLength: [10, "userName is too long"],
      trim: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    age: { type: Number, required: true, min: 18, max: 99 },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], lowercase: true },
    password: {
      type: String,
      required: true,
      min: [5, "Password is too short"],
      max: [15, "Password is too long"],
    },
    isConfirmed: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    forgetCode: String,
    role: {
      type: String,
      enum: ["admin", "seller", "user"],
      default: "user",
      lowercase: true,
    },
    forgetCode: String,
    wishlist: [{ type: Types.ObjectId, ref: "Product" }],
    profilePic: {
      id: {
        type: String,
        default:
          "https://res.cloudinary.com/dmq2km3vq/image/upload/v1715367560/E-Commerce%20App/simple-user-default-icon-free-png_ilhmps.webp",
      },
      url: { type: String },
    },
    coverPics: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// ~pre hooks
userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
  }
});

userSchema.pre(/find/, async function () {
  this.populate({ path: "wishlist", select: "title price discount" });
});

const userModel = model("User", userSchema);
export default userModel;
