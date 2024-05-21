import { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema(
  {
    comment: { type: String, min: 3, max: 200, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

export const reviewModel = model("Review", reviewSchema);
