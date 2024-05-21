import { Schema, Types, model } from "mongoose";

const couponSchema = new Schema(
  {
    name: { type: String, unique: true, required: true, length: 5 },
    createdBy: { type: Types.ObjectId, ref: "User" },
    discount: { type: Number, required: true, min: 1, max: 100 },
    expiredAt: { type: Number, required: true },
  },
  { timestamps: true }
);

export const couponModel = model("Coupon", couponSchema);
