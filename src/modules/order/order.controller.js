import { cartModel } from "../../../DB/models/cart.model.js";
import { orderModel } from "../../../DB/models/order.model.js";

import Stripe from "stripe";
import dotenv from "dotenv";
import { createOrder } from "./order.service.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_KEY);

//& cashOrder
export const cashOrder = async (req, res, next) => {

const order = await createOrder()

  //clear cart
  await cartModel.findOneAndUpdate(
    { user: req.userData._id },
    { products: [] },
    { new: true }
  );

  // TODO
  //send mail with invoice

  //res
  return res.json({ success: true, order });
};

// &paymentSession
export function paymentSession() {
  return async (req, res, next) => {
    const cart = await cartModel.findOne({ user: req.userData._id });
    //check empty cart
    if (cart.products.length === 0)
      return next(
        new Error("Empty Cart!,Try to add some products", { cause: 400 })
      );

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "EGP",
            unit_amount: cart.totalPrice * 100,
            product_data: {
              name: `${req.userData.userName}'s cart`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      customer_email: req.userData.email,
      client_reference_id: cart._id.toString(), //unique id for session after payment
      metadata: {
        shippingAddress: {
          city: req.body.city,
          address: req.body.address,
        },
        phone: req.body.phone,
      },
    });
    // res.json({ url: session.url });
    return session.url
  };
}

// &createWebhook
export const createWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);
  const endpointSecret = process.env.ENDPOINT_STRIPE_SECRET;
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    return res.json({ message: "Done" });
  } else {
    return res.json({ message: "Failed" });
  }
};

export const onlinePayment = async (data) => {
  const { client_reference_id, customer_email } = data;
  const cart = await cartModel.findById(client_reference_id);
  //create order
  const order = await orderModel.create({
    ...req.body,
    isPaid: true,
    user: customer_email,
    products: cart.products.map(
      ({ productId: { title, price, finalPrice, _id }, quantity }) => ({
        quantity,
        product: { title, price, finalPrice, productId: _id },
      })
    ),
    phone: data.metadata.phone,
    phone: data.metadata.shippingAddress,
  });
  if (!order) return next(new Error("Order failed", { cause: 400 }));
};

// TODO
//cancel order
