import { Schema, Types, model } from "mongoose";
import subcategoryModel from "./subcategory.model.js";

const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: [true, "Title must be unique"],
      trim: true,
      minLength: [2, "Title is too short"],
      maxLength: [20, "Title is too long"],
    },
    slug: { type: String, required: true, lowercase: true },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    brand: [{ type: Types.ObjectId, ref: "Brand", required: true }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

// ~virtual populate
categorySchema.virtual("subcategory", {
  localField: "_id",
  ref: "Subcategory",
  foreignField: "category",
});

// ~hook ==> delete subcategory
categorySchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await subcategoryModel.deleteMany({ category: this._id });
  }
);

const categoryModel = model("Category", categorySchema);
export default categoryModel;
