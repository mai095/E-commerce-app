import { Schema, Types, model } from "mongoose";
import categoryModel from "./category.model.js";
import subcategoryModel from "./subcategory.model.js";

const brandSchema = new Schema(
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
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ~hook => delete brand from category&subcategoty
brandSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await categoryModel.updateMany({}, { $pull: { brand: this._id } });
    await subcategoryModel.updateMany({}, { $pull: { brand: this._id } });
  }
);

const brandModel = model("Brand", brandSchema);
export default brandModel;
