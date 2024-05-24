import { Schema, Types, model } from "mongoose";

const orderSchema = new Schema(
  {
    products: [
      //hard coded
      {
        product: {
         // productId: { type: Types.ObjectId, ref: "Product", required: true },
          title: { type: String, required: true },
          price: { type: Number, required: true },
          finalPrice: { type: Number, required: true },
        },
        quantity: { type: Number, min: 1, required: true },
      },
    ],
    user: { type: Types.ObjectId, ref: "User", required: true },
    phone: { type: String, required: true },

    shippingAddress: {
      city: { type: String, required: true },
      address: { type: String, required: true },
    },

    invoice: {
      id: { type: String },
      url: { type: String },
    },

    payment: {
      type: String,
      enum: ["cash", "visa"],
      default: "cash",
    },

    status: {
      type: String,
      enum: [
        "placed",
        "delivered",
        "canceled",
        "shipped",
      ],
      default: "placed",
    },

    isPaid:{
      type: Boolean,
      default: "false",
    },
    
    coupon: { type: Types.ObjectId, ref: "Coupon" },
  },
  { timestamps: true }
);

export const orderModel = model("Order", orderSchema);
