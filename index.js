import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./DB/connection.js";
import { checkDataBase } from "./src/modules/apiHandler.js";
import { allRoutes } from "./src/routes.js";
dotenv.config();

const port = +process.env.PORT;

connectDB();
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

const app = express();
app.use(cors());

app.use((req, res, next) => {
  //webhook use buffer data
  if (req.originalUrl === "/webhook") {
    return next();
  }
  express.json()(req, res, next);
});

checkDataBase();
allRoutes(app);

app.use("*", (req, res, next) => {
  return next(new Error("Url not found", { cause: 404 }));
});

// &Global error handler
app.use((error, req, res, next) => {
  const statusCode = error.cause || 500;
  return res.status(statusCode).json({
    message: false,
    error: error.message,
    stack: error.stack,
  });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
