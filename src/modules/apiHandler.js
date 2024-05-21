import dotenv from "dotenv";
import Stripe from "stripe";
import { cartModel } from "../../DB/models/cart.model.js";
import cloudinary from "../utiltis/cloudinary.js";
import { reviewModel } from "../../DB/models/review.model.js";
import productModel from "../../DB/models/product.model.js";
import schedule from "node-schedule";
import userModel from "../../DB/models/user.model.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_KEY);

export const deleteOne = (model) => {
  return async (req, res, next) => {
    let item = await model.findById(req.params.id);
    if (!item) return next(new Error("Item not found", { cause: 404 }));

    //check owner
    if (item.createdBy._id.toString() !== req.userData._id.toString())
      return next(new Error("Not allow to change this Item", { cause: 403 }));

    await item.deleteOne();

    //delete image
    await cloudinary.uploader.destroy(item.image.id);
    return res.json({ success: true, messgae: "Item deleted successfully" });
  };
};

// !Online payment
// export const onlinePayment = (order) => {
//   console.log("visa");
//   return async (req, res, next) => {
//     const cart = await cartModel.findOne({ user: req.userData._id });
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price_data: {
//             currency: "EGP",
//             unit_amount: cart.totalPrice * 100,
//             product_data: {
//               name: `${req.userData.userName}'s cart`,
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       payment_method_types: ["card"],
//       success_url: process.env.SUCCESS_URL,
//       cancel_url: process.env.CANCEL_URL,
//       customer_email: req.userData.email,
//       client_reference_id: cart._id.toString(),
//       metadata: {
//         shippingAddress: req.body.shippingAddress,
//         order_id: order._id.toString(),
//       },
//     });
//     res.json({ url: session.url });
//   };
// };

//!calc average rate
export const calcAvg = async (productId) => {
  const reviews = await reviewModel.find({ productId });
  let calcRating = 0;
  reviews.forEach((review) => {
    calcRating += review.rating;
  });
  await productModel.findByIdAndUpdate(
    productId,
    { averageRate: (calcRating / reviews.length).toFixed(1) },
    { new: true }
  );
};

// !checkDataBase cronJob
export function checkDataBase() {
  schedule.scheduleJob("0 12 * * 7", async function () {
    await userModel.deleteMany({ isConfirmed: false });
  });
}
