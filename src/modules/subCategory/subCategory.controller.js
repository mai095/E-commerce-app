import slugify from "slugify";
import cloudinary from "../../utiltis/cloudinary.js";
import categoryModel from "../../../DB/models/category.model.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";

// ^addsubcategory
export const addsubcategory = async (req, res, next) => {
  //check title
  const isExist = await subcategoryModel.findOne({ title: req.body.title });
  if (isExist)
    return next(
      new Error("Subcategory title is already exist!", { cause: 400 })
    );

  //check category
  const category = await categoryModel.findById(req.params.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  //create
  await subcategoryModel.create({
    title: req.body.title,
    slug: slugify(req.body.title),
    createdBy: req.userData._id,
    category: req.params.category,
  });
  //res
  return res.json({
    success: true,
    message: "subcategory created successfully",
  });
};

// ^updatesubcategory
export const updatesubcategory = async (req, res, next) => {
  //check category
  const category = await categoryModel.findById(req.params.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  //check subcategory
  const subcategory = await subcategoryModel.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("subcategory not found", { cause: 404 }));

  //check owner
  if (subcategory.createdBy._id.toString() !== req.userData._id.toString())
    return next(
      new Error("Not allowes to change this subcategory", { cause: 403 })
    );

  //update
  subcategory.title = req.body.title ? req.body.title : subcategory.title;
  subcategory.slug = req.body.title
    ? slugify(req.body.title)
    : subcategory.slug;
  await subcategory.save();

  //res
  return res.json({
    success: true,
    message: "subcategory updated successfully",
  });
};

// ^deletesubcategory
export const deletesubcategory = async (req, res, next) => {
  //check category
  const category = await categoryModel.findById(req.params.category);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  //check subcategory
  const subcategory = await subcategoryModel.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("subcategory not found", { cause: 404 }));

  //check owner
  if (subcategory.createdBy._id.toString() !== req.userData._id.toString())
    return next(
      new Error("Not allowes to change this subcategory", { cause: 403 })
    );
  await subcategory.deleteOne();

  //res
  return res.json({
    success: true,
    message: "subcategory deleted successfully",
  });
};

// ^getSubcategory
export const getSubcategory = async (req, res, next) => {
  if (req.params.category) {
    if (req.body.id) {
      const subcategory = await subcategoryModel.findById(req.body.id);
      return res.json({ success: true, subcategory });
    }
    const subcategories = await subcategoryModel.find({
      category: req.params.category,
    });
    return res.json({ success: true, subcategories });
  }
  if (req.body.id) {
    const subcategory = await subcategoryModel.findById(req.body.id);
    return res.json({ success: true, subcategory });
  }
  const subcategory = await subcategoryModel.find();
  return res.json({ success: true, subcategory });
};
