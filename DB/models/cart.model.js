import { Schema, Types, model } from "mongoose";

const cartSchema = new Schema(
  {
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    user: { type: Types.ObjectId, ref: "User", unique: true, required: true },
    coupon: { type: Types.ObjectId, ref: "Coupon" },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

// ~virtual populate from array
cartSchema.pre(/find/, async function () {
  this.populate({
    path: "products",
    populate: { path: "productId", model: "Product" },
  });
  this.populate({ path: "coupon", model: "Coupon" });

});

// ~virtual populate ==> calc total price of cart
cartSchema.virtual("totalPrice").get(function () {
  const total = this.products.reduce(
    (acc, current) => acc + current.productId.finalPrice * current.quantity,
    0
  );
  return total;
});

cartSchema.virtual("discountedPrice").get(function () {
  const total = this.products.reduce(
    (acc, current) => acc + current.productId.finalPrice * current.quantity,
    0
  );
  return total - ((this.coupon?.discount || 0) / 100) * total;
});

export const cartModel = model("Cart", cartSchema);
