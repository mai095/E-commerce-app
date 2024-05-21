import { orderModel } from "../../../DB/models/order.model.js";
import { reviewModel } from "../../../DB/models/review.model.js";
import { calcAvg } from "../apiHandler.js";

// *addReview
export const addReview = async (req, res, next) => {
  const { productId } = req.params;
  const { comment, rating } = req.body;

  const deliveredProduct = await orderModel.findOne({
    user: req.userData._id,
    "products.product.productId": productId,
    status: "delivered",
  });
  if (!deliveredProduct)
    return next(
      new Error("You Can't review a product before try it!", { cause: 400 })
    );

  //   check prevReviews
  const prevReviews = await reviewModel.findOne({
    createdBy: req.userData._id,
    productId: req.params.productId,
  });
  if (prevReviews)
    return next(
      new Error("You are reviewed this product before", { cause: 400 })
    );

  //   create review in DB
  const review = await reviewModel.create({
    comment,
    rating,
    productId,
    createdBy: req.userData._id,
  });

  //calc rating average
  calcAvg(productId);
  return res.json({ success: true, review });
};

// *updateReview
export const updateReview = async (req, res, next) => {
  const { productId } = req.params;
  await reviewModel.updateOne(
    { createdBy: req.userData._id, productId },
    { ...req.body }
  );

  //update avgerage
  if (req.body.rating) calcAvg(productId);

  return res.json({ success: true, message: "Review updated successfuly" });
};
