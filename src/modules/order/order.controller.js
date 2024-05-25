import { cartModel } from "../../../DB/models/cart.model.js";
import { orderModel } from "../../../DB/models/order.model.js";
import productModel from "../../../DB/models/product.model.js";
import { createOrder } from "./order.service.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_KEY);

//& cashOrder
export const cashOrder = async (req, res, next) => {
  const order = await createOrder(req, res, next);
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
export const paymentSession = async (req, res, next) => {
  const order = await createOrder(req, res, next);
  const cart = await cartModel.findOne({ user: req.userData._id });
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
    metadata: { orderId: order._id.toString() },
  });
  res.json({ url: session.url });
};

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
    const orderId = event.data.object.metadata.orderId;
    await orderModel.findOneAndUpdate(
      { _id: orderId },
      { isPaid: true },
      { new: true }
    );

    //clear cart
    await cartModel.findOneAndUpdate(
      { user: req.userData._id },
      { products: [] },
      { new: true }
    );
  } else {
    return res.json({ message: "Failed" });
  }
};

//&cancelOrder
export const cancelOrder = async (req, res, next) => {

  const order = await orderModel.findById(req.params.orderId);
  if (!order) return next(new Error("Order not found", { cause: 404 }));

  //check status
  if (order.status !== "placed")
    return next(
      new Error(`Sorry order can't be canceled at status ${order.status}`)
    );
    const options = order.products.map((product) => ({
      updateOne: {
        filter: { _id: product.product.productId },
        update: {
          $inc: { quantity: product.quantity, sold: -product.quantity },
        },
      },
    }));
    await productModel.bulkWrite(options);


  //res
  return res.json({
    success: true,
    message: "Order Canceled",
  });
};
