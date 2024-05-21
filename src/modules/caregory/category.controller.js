import slugify from "slugify";
import categoryModel from "../../../DB/models/category.model.js";
import cloudinary from "../../utiltis/cloudinary.js";
import { deleteOne } from "../apiHandler.js";

// ^addCategory
export const addCategory = async (req, res, next) => {
  const isExist = await categoryModel.findOne({ title: req.body.title });
  if (isExist)
    return next(new Error("Category title is already exist!", { cause: 400 }));

  //check image
  if (!req.file)
    return next(new Error("Category image is required", { cause: 400 }));

  //upload in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_FOLDER}/category` }
  );

  //create
  await categoryModel.create({
    title: req.body.title,
    slug: slugify(req.body.title),
    createdBy: req.userData._id,
    image: {
      id: public_id,
      url: secure_url,
    },
  });
  //res
  return res.json({ success: true, message: "Category created successfully" });
};

// ^updateCategory
export const updateCategory = async (req, res, next) => {
  //check category
  const category = await categoryModel.findById(req.params.id);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  //check owner
  if (category.createdBy._id.toString() !== req.userData._id.toString())
    return next(
      new Error("Not allowes to change this category", { cause: 403 })
    );

  //check image
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: category.image.id }
    );
    category.image = {
      url: secure_url,
      id: public_id,
    };
    await category.save();
  }

  //update
  category.title = req.body.title ? req.body.title : category.title;
  category.slug = req.body.title ? slugify(req.body.title) : category.slug;
  await category.save();

  //res
  return res.json({
    success: true,
    message: "category updated successfully",
  });
};

// ^deleteCategory
export const deleteCategory = deleteOne(categoryModel);

// ^getCategory
export const getCategory = async (req, res, next) => {
  if (!req.body.id) {
    const categories = await categoryModel.find().populate([
      {
        path: "subcategory",
        populate: { path: "createdBy", select: "email" },
      },
      { path: "createdBy", select: "email" },
    ]);
    return res.json({ success: true, categories });
  }
  const categories = await categoryModel
    .findById({ _id: req.body.id })
    .populate([
      {
        path: "subcategory",
        select: "title",
        populate: { path: "createdBy", select: "email" },
      },
      { path: "createdBy", select: "email" },
    ]);
  return res.json({ success: true, categories });
};
