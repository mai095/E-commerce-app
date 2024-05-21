import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./DB/connection.js";
import { checkDataBase } from "./src/modules/apiHandler.js";
import { allRoutes } from "./src/routes.js";
dotenv.config();

const port = +process.env.PORT;

connectDB();
const app = express();
app.use(cors());

app.use((req, res, next) => {
  //webhook user buffer data
  if (req.originalUrl === "/order/webhook") {
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
