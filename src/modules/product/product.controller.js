import { nanoid } from "nanoid";
import slugify from "slugify";
import brandModel from "../../../DB/models/brand.model.js";
import categoryModel from "../../../DB/models/category.model.js";
import productModel from "../../../DB/models/product.model.js";
import subcategoryModel from "../../../DB/models/subcategory.model.js";
import cloudinary from "../../utiltis/cloudinary.js";

// &addProduct
export const addProduct = async (req, res, next) => {
  //check title
  const isExist = await productModel.findOne({ title: req.body.title });
  // if (isExist)
  //   return next(new Error("Product title is already exist!", { cause: 400 }));

  //check category
  const category = await categoryModel.findById(req.body.category);
  if (!category)
    return next(new Error("This category not found", { cause: 404 }));

  //check subcategory
  const subcategory = await subcategoryModel.findById(req.body.subcategory);
  if (!subcategory)
    return next(new Error("This subcategory not found", { cause: 404 }));

  //check brand
  const brand = await brandModel.findById(req.body.brand);
  if (!brand) return next(new Error("This brand not found", { cause: 404 }));

  //check image
  if (!req.files)
    return next(new Error("Product images are required", { cause: 400 }));

  //create cloudFolder
  const cloudFolder = nanoid();

  //upload images
  const images = [];
  for (const image of req.files.images) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      image.path,
      { folder: `${process.env.CLOUD_FOLDER}/product/${cloudFolder}/images` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  //upload coverImage
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.coverImage[0].path,
    { folder: `${process.env.CLOUD_FOLDER}/product/${cloudFolder}/coverImage` }
  );
  //create in DB
  await productModel.create({
    ...req.body,
    slug: slugify(req.body.title),
    images,
    coverImage: { id: public_id, url: secure_url },
    cloudFolder,
    createdBy: req.userData._id,
  });
  //res
  return res.json({ success: true, message: "Product created successfully" });
};

// &updateProduct
export const updateProduct = async (req, res, next) => {
  //check product
  const product = await productModel.findById(req.params.id);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  //check owner
  if (product.createdBy._id.toString() !== req.userData._id.toString())
    return next(
      new Error("Not allowes to change this product", { cause: 403 })
    );
  //check image
  if (req.files) {
    const images = [];
    for (const image of req.files.images) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        { public_id: product.images.id }
      );
      images.push({ id: public_id, url: secure_url });
    }

    //upload coverImage
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.coverImage[0].path,
      { public_id: product.images.id }
    );
    product.imageCover = { id: public_id, url: secure_url };
  }

  //update
  await productModel.updateOne({ _id: req.params.id }, { ...req.body });
  //res
  return res.json({
    success: true,
    message: "Product updated successfully",
  });
};

// &deleteProduct
export const deleteProduct = async (req, res, next) => {
  //check product
  const product = await productModel.findById(req.params.id);
  if (!product) return next(new Error("Product not found", { cause: 404 }));

  //check owner
  if (req.userData._id.toString() !== product.createdBy.toString())
    return next(
      new Error("Not allowed to delete this product", { cause: 403 })
    );

  //delete
  await product.deleteOne();

  //res
  return res.json({
    success: true,
    message: "Product deleted successfully",
  });
};

// &getProduct
export const getProduct = async (req, res, next) => {
  if (req.query.id) {
    const products = await productModel.findById(req.query.id);
    if (!products) return next(new Error("Product not found", { cause: 404 }));

    return res.json({ success: true, products });
  }
  const { sort, page, keyword } = req.query;
  const products = await productModel
    .find({ ...req.query })
    .sort(sort) //price[$gt]=3000
    .search(keyword);

  // .pagenation(page);
  return res.json({ success: true, products });
};
