import { cartModel } from "../../../DB/models/cart.model.js";
import { orderModel } from "../../../DB/models/order.model.js";
import productModel from "../../../DB/models/product.model.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

//& cashOrder
export const cashOrder = async (req, res, next) => {
  //get user cart
  const cart = await cartModel.findOne({ user: req.userData._id });
  if (!cart) return next(new Error("Cart not found", { cause: 404 }));

  //check empty cart
  if (cart.products.length === 0)
    return next(
      new Error("Empty Cart!,Try to add some products", { cause: 400 })
    );

  //check product
  for (let i = 0; i < cart.products.length; i++) {
    const product = await productModel.findById(cart.products[i].productId);
    if (!product)
      return next(
        new Error(`This product ${cart.products[i].productId} not found`, {
          casue: 404,
        })
      );

    //check stock
    if (!product.inStock(cart.products[i].quantity))
      return next(
        new Error(
          `${product._id} Out of stock, Only ${product.quantity} items are available`
        )
      );
  }

  //create order
  const order = await orderModel.create({
    ...req.body,
    user: req.userData._id,
    products: cart.products.map(
      ({ productId: { title, price, finalPrice, _id }, quantity }) => ({
        quantity,
        product: { title, price, finalPrice, productId: _id },
      })
    ),
  });
  if (!order) return next(new Error("Order failed", { cause: 400 }));

  //update stock by bulkWrite
  if (order) {
    const options = cart.products.map((product) => ({
      updateOne: {
        filter: { _id: product.productId },
        update: {
          $inc: { quantity: -product.quantity, sold: product.quantity },
        },
      },
    }));
    await productModel.bulkWrite(options);
  }

  //clear cart
  await cartModel.findOneAndUpdate(
    { user: req.userData._id },
    { products: [] },
    { new: true }
  );

  //send mail with invoice

  //res
  return res.json({ success: true, order });
};

// &paymentSession
export const paymentSession = async (req, res, next) => {
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
  });
  res.json({ url: session.url });
};
