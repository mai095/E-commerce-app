import { Schema, Types, model } from "mongoose";
import cloudinary from "../../src/utiltis/cloudinary.js";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: [true,'title must be unique'],
      trim: true,
      minLength: [2, "Title is too short"],
      maxLength: [20, "Title is too long"],
    },
    slug: { type: String, required: true, lowercase: true },
    description: {
      type: String,
      required: true,
      min: [2, "Description is too short"],
      max: [300, "Description is too long"],
    },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 1, max: 100 },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Types.ObjectId, ref: "subcategory", required: true },
    brand: { type: Types.ObjectId, ref: "Brand", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    coverImage: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    cloudFolder: { type: String, unique: true, required: true },
    sold: { type: Number, default: 0, required: true },
    quantity: { type: Number, default: 0, required: true },
    averageRate: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// ~virtual populate
productSchema.virtual("finalPrice").get(function () {
  return Number.parseFloat(
    this.price - (this.price * this.discount || 0) / 100
  ).toFixed(2);
});


// ~hook ==> delete images
productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const ids = this.images.map((image) => image.id);
    ids.push(this.coverImage.id);
    await cloudinary.api.delete_resources(ids);
    await cloudinary.api.delete_folder(
      `${process.env.CLOUD_FOLDER}/product/${this.cloudFolder}`,

    );
  }
);

// ~query helper ==> search
productSchema.query.search = function (keyword) {
  if (keyword) {
    return this.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
  }
  return this;
};

// ~query helper ==> pagenation
productSchema.query.pagenation = function (page) {
  page = page < 1 || isNaN(page) || !page ? 1 : page;
  const limit = 20;
  const skip = limit * (page - 1);
  return this.find().limit(limit).skip(skip);
};

// ~method ==> inStock
productSchema.methods.inStock = function (requiredQuantity) {
  return this.quantity >= requiredQuantity ? true : false;
};

// ~virtual  ==> review
productSchema.virtual("review", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

const productModel = model("Product", productSchema);
export default productModel;
