const mongoose = require("mongoose");
const saloon = require("../../api/saloonstore/model");
const Category = require("../../models/categoryModel");
const saloonService = require("../../api/saloonService/model");
const productService = require("../service/productService");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.addProductPage = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const category = await Category.find();
    let serviceData = null;

    if (req.query.id && isValidObjectId(req.query.id)) {
      serviceData = await saloonService.findById(req.query.id);
    }

    return res.render("product/add-product", {
      user: req.user,
      category,
      service_data: serviceData,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load add product page.");
    return res.redirect("/view-product");
  }
};

exports.addProductStore = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const { body, files, query } = req;

    if (Array.isArray(files) && files.length > 0) {
      body.image = files.map((element) => element.filename);
    }

    if (query.id && isValidObjectId(query.id)) {
      await saloonService.findByIdAndUpdate(query.id, body);
      req.flash("success", "Product updated successfully.");
      return res.redirect("/view-product");
    }

    await saloonService.create(body);
    req.flash("success", "Product added successfully.");
    return res.redirect("/view-product");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save product.");
    return res.redirect("/add-product");
  }
};

exports.viewProductPage = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = await productService.fetchProductList(req);
    return res.render("product/view-product", {
      query: req.query,
      user: req.user,
      data,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load products.");
    return res.redirect("/");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.query.id)) {
      req.flash("error", "Invalid product id.");
      return res.redirect("/view-product");
    }

    await saloonService.findByIdAndDelete(req.query.id);
    req.flash("success", "Product deleted successfully.");
    return res.redirect("/view-product");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete product.");
    return res.redirect("/view-product");
  }
};

exports.getProductCategoryOptions = async (req, res) => {
  try {
    const parentId = req.query.select;
    if (!parentId || !isValidObjectId(parentId)) {
      return res.send([]);
    }

    const subCategory = await Category.find({
      parent_Name: mongoose.Types.ObjectId(parentId),
    });

    const data = subCategory.map((item) => ({
      _id: item._id,
      Name: item.Name,
      parent_Name: item.parent_Name,
    }));

    return res.send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send([]);
  }
};

exports.findSaloon = async (req, res) => {
  try {
    if (!isValidObjectId(req.query.id)) {
      return res.status(400).send({});
    }

    const data = await saloon.findOne(
      { _id: mongoose.Types.ObjectId(req.query.id) },
      { type: 1, storeName: 1 }
    );

    return res.send(data || {});
  } catch (error) {
    console.log(error);
    return res.status(500).send({});
  }
};

exports.findAllProductName = async () => {
  try {
    const names = await saloonService.distinct("ServiceName", { ServiceName: { $ne: "" } });
    return names.filter(Boolean);
  } catch (error) {
    console.log(error);
    return [];
  }
};
