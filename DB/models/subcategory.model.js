import { Schema, Types, model } from "mongoose";

const subcategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [2, "Title is too short"],
      maxLength: [20, "Title is too long"],
    },
    slug: { type: String, required: true, lowercase: true },
    category: { type: Types.ObjectId, ref: "Category" },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    brand: [{ type: Types.ObjectId, ref: "Brand", required: true }],
  },
  { timestamps: true }
);

const subcategoryModel = model("Subcategory", subcategorySchema);

export default subcategoryModel;
