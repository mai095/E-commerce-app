import slugify from "slugify";
import brandModel from "../../../DB/models/brand.model.js";
import categoryModel from "../../../DB/models/category.model.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import cloudinary from "../../utiltis/cloudinary.js";
import { deleteOne } from "../apiHandler.js";

// ^addBrand
export const addBrand = async (req, res, next) => {
  const { categories, subcategories, title } = req.body;
  //check title
  const isExist = await brandModel.findOne({ title });
  if (isExist)
    return next(new Error("Brand title is already exist!", { cause: 400 }));

  //check category
  categories.forEach(async (categoryId) => {
    const category = await categoryModel.findById(categoryId);
    !category && next(new Error("Category not found", { cause: 404 }));
  });

  //check subcategory
  subcategories.forEach(async (subcategoryId) => {
    const subcategory = await subcategoryModel.findById(subcategoryId);
    if (!subcategory)
      return next(new Error("Subcategory not found", { cause: 404 }));
  });

  //check image
  if (!req.file)
    return next(new Error("Brand image is required", { cause: 400 }));

  //upload in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_FOLDER}/brand` }
  );

  //create
  const brand = await brandModel.create({
    title,
    slug: slugify(req.body.title),
    createdBy: req.userData._id,
    image: {
      id: public_id,
      url: secure_url,
    },
  });

  categories.forEach(async (category) => {
    await categoryModel.findByIdAndUpdate(category, {
      $push: { brand: brand._id },
    });
  });
  subcategories.forEach(async (subcategory) => {
    await subcategoryModel.findByIdAndUpdate(subcategory, {
      $push: { brand: brand._id },
    });
  });

  //res
  return res.json({
    success: true,
    message: "Brand created successfully",
  });
};

// ^updateBrand
export const updateBrand = async (req, res, next) => {
  //check brand
  const brand = await brandModel.findById(req.params.id);
  if (!brand) return next(new Error("Brand not found", { cause: 404 }));

  //check owner
  if (brand.createdBy._id.toString() !== req.userData._id.toString())
    return next(new Error("Not allowes to change this brand", { cause: 403 }));

  //check image
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: brand.image.id }
    );
    brand.image = {
      url: secure_url,
      id: public_id,
    };
    await brand.save();
  }

  //update
  brand.title = req.body.title ? req.body.title : brand.title;
  brand.slug = req.body.title ? slugify(req.body.title) : brand.slug;
  await brand.save();

  //res
  return res.json({
    success: true,
    message: "Brand updated successfully",
  });
};

// ^deleteBrand
export const deleteBrand = deleteOne(brandModel);

// ^getBrand
export const getBrand = async (req, res, next) => {
  if (req.query.category) {
    const category = await categoryModel
      .findById(req.query.category)
      .select("title")
      .populate("brand");
    if (!category) return next(new Error("Category not found", { cause: 404 }));
    //res
    return res.json({
      success: true,
      category,
    });
  }
  const brands = await brandModel.find();
  //res
  return res.json({
    success: true,
    brands,
  });
};
