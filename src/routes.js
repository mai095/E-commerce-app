import authRouter from "./modules/auth/auth.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import categoryRouter from "./modules/caregory/caregory.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import orderRouter from "./modules/order/order.router.js";
import productRouter from "./modules/product/product.router.js";
import reviewRouter from "./modules/review/review.router.js";
import subcategoryRouter from "./modules/subCategory/subCategory.router.js";
import wishlistRouter from "./modules/wishlist/wishlist.router.js";

export const allRoutes = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/category", categoryRouter);
  app.use("/api/v1/subcategory", subcategoryRouter);
  app.use("/api/v1/brand", brandRouter);
  app.use("/api/v1/product", productRouter);
  app.use("/api/v1/coupon", couponRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/order", orderRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/review", reviewRouter);
};

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);
const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.ENDPOINT_STRIPE_SECRET;

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const data = event.data.object;
        console.log(data);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);
