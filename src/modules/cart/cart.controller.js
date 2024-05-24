import { cartModel } from "../../../DB/models/cart.model.js";
import { couponModel } from "../../../DB/models/coupon.model.js";
import productModel from "../../../DB/models/product.model.js";

// ^addToCart
export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  //check product
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  //check product in cart
  const productInCart = await cartModel.findOne({
    //return cart
    user: req.userData._id,
    "products.productId": productId,
  });

  if (productInCart) {
    const theProduct = productInCart.products.find(
      (prd) => prd.productId._id.toString() === productId
    );

    if (!product.inStock(theProduct.quantity))
      return next(
        new Error(`Sorry, Only ${product.quantity} items are available`)
      );
    theProduct.quantity += quantity;
    await productInCart.save();

    return res.json({ success: true, message: "Product added successfully" });
  }

  //check stock
  if (!product.inStock(quantity))
    return next(
      new Error(`Sorry only ${product.quantity} item are avaliable`, {
        cause: 400,
      })
    );

  // add to cart
  const cart = await cartModel.findOneAndUpdate(
    { user: req.userData._id },
    { $push: { products: { productId, quantity } } },
    { new: true }
  );

  return res.json({ success: true, message: "Product added successfully" });
};

// ^updateCart
export const updateCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  //checkproduct
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  //check stock
  if (!product.inStock(quantity))
    return next(
      new Error(`Sorry only ${product.quantity} item are avaliable`, {
        cause: 400,
      })
    );

  //check cart & update
  const productInCart = await cartModel.findOneAndUpdate(
    {
      user: req.userData._id,
      "products.productId": productId,
    },
    { "products.$.quantity": quantity },
    { new: true }
  );
  if (!productInCart)
    return next(new Error("Product not found in the cart", { cause: 404 }));

  //res
  return res.json({ success: true, message: "Cart updated successfully" });
};

// ^getCart
export const getCart = async (req, res, next) => {
  if (req.userData.role === "user") {
    const cart = await cartModel.findOne({ user: req.userData._id });
    return res.json({ success: true, cart });
  }
  if (req.userData.role === "admin" && !req.body.cartId)
    return next(new Error("CartId is required", { cause: 400 }));
  const cart = await cartModel.findById(req.body.cartId);
  return res.json({ success: true, cart });
};

// ^removeProduct
export const removeProduct = async (req, res, next) => {
  const { productId } = req.params;
  //check product in cart &remove
  const product = await cartModel.findOneAndUpdate(
    {
      user: req.userData._id,
      "products.productId": productId,
    },
    { $pull: { products: { productId } } },
    { new: true }
  );

  if (!product)
    return next(
      new Error("This product not found in the cart", { cause: 404 })
    );

  //res
  return res.json({ success: true, message: "Product deleted successfully" });
};

// ^clearCart
export const clearCart = async (req, res, next) => {
  //check cart & clear
  const cart = await cartModel.findOneAndUpdate(
    { user: req.userData._id },
    { products: [] },
    { new: true }
  );
  if (!cart) return next(new Error("Cart not found", { cause: 404 }));

  //res
  return res.json({ success: true, message: "Your cart is empty now!" });
};

// ^applyCoupon
export const applyCoupon = async (req, res, next) => {
  const cart = await cartModel.findOne({ user: req.userData._id });
  if (req.body.coupon) {
    const coupon = await couponModel.findOne({
      _id: req.body.coupon,
      expiredAt: { $gte: Date.now() },
    });
    if (!coupon) return next(new Error("Invalid coupon", { cause: 400 }));
    cart.coupon = coupon._id;
    await cart.save();
    return res.json({ success: true, message: "Coupon add to your cart" });
  }
};
