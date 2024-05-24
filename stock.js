import { cartModel } from "../../../DB/models/cart.model.js";
import { orderModel } from "../../../DB/models/order.model.js";
import productModel from "../../../DB/models/product.model.js";

import { fileURLToPath } from "url";
import cloudinary from "../../utiltis/cloudinary.js";
import sendEmail from "../../utiltis/sendEmail.js";
import createInvoice from "../../utiltis/pdf.Invoice.js";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

// *createOrder
export const createOrder = async (req, res, next) => {
  //check cart
  const cart = await cartModel.findOne({ user: req.userData._id });
  if (cart.products.length === 0) {
    return next(new Error("Empty Cart!", { cause: 400 }));
  }

  //check product &stock
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

  //todo study 
  //update quantity by bulkWrite
  if (order) {
    const options = cart.products.map((prod) => ({
      updateOne: {
        filter: { _id: prod.productId },
        update: { $inc: { quantity: -prod.quantity, sold: prod.quantity } },
      },
    }));

    await productModel.bulkWrite(options);
    await order.save();
  }

  // onlinePayment
  if (req.body.payment === "visa") {
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
      client_reference_id: cart._id.toString(),
      metadata: { order_id: order._id.toString() },
    });
    res.json({ url: session.url });
  }

  //clear cart
  await cartModel.findOneAndUpdate(
    { user: req.userData._id },
    { products: [] }
  );

  // createInvoice
  const invoice = {
    shipping: {
      name: req.userData.userName,
      address: req.body.shippingAddress.address,
      city: req.body.shippingAddress.city,
      country: "Egypt",
    },
    items: order.products,
    price: cart.totalPrice, //before discount
    afterDiscount: cart.discountedPrice, //after discount
    invoice_nr: order._id,
  };

  //pdfPath
  const pdfPath = path.join(__dirname, `../../tempInvoices/${order._id}.pdf`);
  createInvoice(invoice, pdfPath);

  //upload in cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUD_FOLDER}/orders/invoices`,
  });

  order.invoice = {
    id: public_id,
    url: secure_url,
  };
  await order.save();

  //send email
  const isSent = await sendEmail({
    to: req.userData.email,
    subject: "Order Invoice",
    attachments: [{ path: secure_url, contentType: "application/pdf" }],
  });
  if (!isSent) return next(new Error("Invalid Email", { cause: 404 }));

  return res.json({ success: true, message: "Order is created" });
};

// *webHook
export const orderWebhook = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_STRIPE_SECTET
    );
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  const orderId = event.data.object.metadata.order_id;
  const data =  event.data.object
  
  if (event.type === "checkout.session.completed") {
    console.log("done",data);
    await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: "payed by visa" },
      { new: true }
    );
  } else {
    await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: "failed to pay" },
      { new: true }
    );
  }
};

// *getOrder
export const getOrder = async (req, res, next) => {
  const orders = await orderModel.find({ user: req.userData._id });
  if (orders.length === 0)
    return next(new Error("You didn't make any order yet!"));
  return res.json({ success: true, orders });
};

// *cancelOrder
//TODO
// export const cancelOrder = async (req, res, next) => {
//   //check order
//   const order = await orderModel.findById(req.params.id);
//   if (!order) return next(new Error("Order not found", { cause: 404 }));
//   //check status
//   if (
//     (order.status == "delivered" || order.status == "shipped" || order.status == "canceled")
//   )
//     return next(
//       new Error(`Sorry order can't be canceled at status ${order.status}`)
//     );

//   //cancel order
//   order.status = "canceled";
//   await order.save();
//   //update stock
//   updateStock(order.products, false);
//   //res
//   return res.json({
//     success: true,
//     message: "Order Canceled",
//   });
// };
