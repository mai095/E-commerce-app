import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.URL_CONNECTION)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log("Failed connection to DB", err);
    });
};
