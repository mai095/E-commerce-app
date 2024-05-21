import productModel from "../../../DB/models/product.model.js";
import userModel from "../../../DB/models/user.model.js";

// ^addToWishlist
export const addToWishlist = async (req, res, next) => {
  //check product in productModel
  const product = await productModel.findById(req.body.productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  //check product in wishlist
  const productInList = await userModel.findOne({
    _id: req.userData._id,
    wishlist: req.body.productId,
  });
  if (productInList)
    return next(new Error("Product already added", { cause: 400 }));

  //add
  await userModel.findOneAndUpdate(
    { _id: req.userData._id },
    { $addToSet: { wishlist: req.body.productId } },
    { new: true }
  );

  //res
  return res.json({ success: true, message: "Product added to wishlist" });
};

// ^removeFromWishlist
export const removeFromWishlist = async (req, res, next) => {
  //check product in wishlist
  const productInList = await userModel.findOne({
    _id: req.userData._id,
    wishlist: req.body.productId,
  });
  if (!productInList)
    return next(new Error("Product not found in wishlist", { cause: 404 }));

  //remove
  await userModel.findOneAndUpdate(
    { _id: req.userData._id },
    { $pull: { wishlist: req.body.productId } },
    { new: true }
  );

  //res
  return res.json({ success: true, message: "Product removed from wishlist" });
};

// ^getWishlist
export const getWishlist = async (req, res, next) => {
  const results = await userModel
    .findOne({ _id: req.userData._id }).select('email')
    // .populate({ path: "wishlist", select: "title" });
  return res.json({ success: true, results });
};
