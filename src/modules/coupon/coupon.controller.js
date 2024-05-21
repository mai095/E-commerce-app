import voucherCode from "voucher-code-generator";
import { couponModel } from "../../../DB/models/coupon.model.js";
import QrCode from "qrcode";

// &createCoupon
export const createCoupon = async (req, res, next) => {
  //generate coupon
  const coupon = voucherCode.generate({ length: 5, charset: "numeric" });
  //add in DB
  await couponModel.create({
    name: coupon[0],
    createdBy: req.userData._id,
    discount: req.body.discount,
    expiredAt: new Date(req.body.expiredAt).getTime(),
  });
  //res
  return res.json({ success: true, message: "Coupon created successfully" });
};

// &updateCoupon
export const updateCoupon = async (req, res, next) => {
  //check coupon
  const coupon = await couponModel.findOne({
    _id: req.params.id,
    expiredAt: { $gt: Date.now() },
  });
  if (!coupon) return next(new Error("Coupon not found", { cause: 404 }));

  //check owner
  if (coupon.createdBy.toString() !== req.userData._id.toString())
    return next(new Error("Not allowed to change this coupon", { cause: 403 }));

  //update
  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt).getTime()
    : coupon.expiredAt;

  await coupon.save();
  //res
  return res.json({
    success: true,
    message: "Coupon updated successfully",
    coupon,
  });
};

// &deleteCoupon
export const deleteCoupon = async (req, res, next) => {
  //check coupon
  const coupon = await couponModel.findOne({
    _id: req.params.id,
    expiredAt: { $gt: Date.now() },
  });
  if (!coupon) return next(new Error("Coupon not found", { cause: 404 }));

  //check owner
  if (coupon.createdBy.toString() !== req.userData._id.toString())
    return next(new Error("Not allowed to change this coupon", { cause: 403 }));

  //delete
  await coupon.deleteOne();
  //res
  return res.json({
    success: true,
    message: "Coupon deleted successfully",
  });
};

// &getCoupon
export const getCoupon = async (req, res, next) => {
  
  if (req.query.id) {
    const coupon = await couponModel.findById(req.query.id);
    if(!coupon) return next(new Error("Coupon not found",{cause:404}))
    const qrcode = await QrCode.toDataURL(coupon.name);
    return res.json({ success: true, coupon, qrcode });
  }
  if (req.userData.role == "admin") {
    const coupons = await couponModel.find();
    return res.json({ success: true, coupons });
  } else {
    const coupons = await couponModel.find({ createdBy: req.userData._id });
    return res.json({ success: true, coupons });
  }
};
