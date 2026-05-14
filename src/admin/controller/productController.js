const mongoose = require("mongoose");
const saloon = require("../../models/saloonStoreModel");
const Category = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const productService = require("../service/productService");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const getNormalizedRole = (value) => String(value || "").toLowerCase();
const getStoreScopeForUser = (user) =>
  getNormalizedRole(user?.type) === "admin" ? { userId: user?._id } : {};

exports.addProductPage = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const categoryCondition = { type: { $in: ["product", 0, "0", null] } };
    const saloonCondition = getStoreScopeForUser(req.user);
    if (req.headers['tendentId']) {
      categoryCondition.tendentId = req.headers['tendentId'];
      saloonCondition.tendentId = req.headers['tendentId'];
    }
    const category = await Category.find(categoryCondition);
    const saloonList = await saloon
      .find(saloonCondition, { _id: 1, storeName: 1 })
      .sort({ storeName: 1 });
    let serviceData = null;

    if (req.query.id && isValidObjectId(req.query.id)) {
      serviceData = await productModel.findById(req.query.id);
    }

    return res.render("product/add-product", {
      user: req.user,
      category,
      saloonList,
      service_data: serviceData,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load add product page.");
    return res.redirect("/admin/view-product");
  }
};

exports.addProductStore = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const { body, files, query } = req;
    if (req.headers['tendentId']) {
      body.tendentId = req.headers['tendentId'];
    }
    const storeScope = getStoreScopeForUser(req.user);

    if (!body.saloonStore || !isValidObjectId(body.saloonStore)) {
      req.flash("error", "Please select a valid saloon.");
      return res.redirect(query.id ? `/add-product?id=${query.id}` : "/add-product");
    }
    body.saloonStore = mongoose.Types.ObjectId(body.saloonStore);

    const storeExists = await saloon.findOne({ _id: body.saloonStore, ...storeScope }).select({ _id: 1 });
    if (!storeExists) {
      req.flash("error", "You are not allowed to use this saloon.");
      return res.redirect(query.id ? `/add-product?id=${query.id}` : "/add-product");
    }

    if (!body.category || !isValidObjectId(body.category)) {
      req.flash("error", "Please select a valid category.");
      return res.redirect(query.id ? `/add-product?id=${query.id}` : "/add-product");
    }
    body.category = mongoose.Types.ObjectId(body.category);

    if (Array.isArray(files) && files.length > 0) {
      body.image = files.map((element) => element.filename);
    }

    if (query.id && isValidObjectId(query.id)) {
      await productModel.findByIdAndUpdate(query.id, body);
      req.flash("success", "Product updated successfully.");
      return res.redirect("/admin/view-product");
    }

    await productModel.create(body);
    req.flash("success", "Product added successfully.");
    return res.redirect("/admin/view-product");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save product.");
    return res.redirect("/admin/add-product");
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
    return res.redirect("/admin/");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.query.id)) {
      req.flash("error", "Invalid product id.");
      return res.redirect("/admin/view-product");
    }

    await productModel.findByIdAndDelete(req.query.id);
    req.flash("success", "Product deleted successfully.");
    return res.redirect("/admin/view-product");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete product.");
    return res.redirect("/admin/view-product");
  }
};

exports.getProductCategoryOptions = async (req, res) => {
  try {
    const parentId = req.query.select;
    if (!parentId || !isValidObjectId(parentId)) {
      return res.send([]);
    }

    const condition = {
      parent_Name: mongoose.Types.ObjectId(parentId),
    };
    if (req.headers['tendentId']) {
      condition.tendentId = req.headers['tendentId'];
    }
    const subCategory = await Category.find(condition);

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
    const storeScope = getStoreScopeForUser(req.user);
    if (!isValidObjectId(req.query.id)) {
      return res.status(400).send({});
    }

    const data = await saloon.findOne(
      { _id: mongoose.Types.ObjectId(req.query.id), ...storeScope },
      { type: 1, storeName: 1 }
    );

    return res.send(data || {});
  } catch (error) {
    console.log(error);
    return res.status(500).send({});
  }
};

exports.findAllProductName = async (tendentId) => {
  try {
    const condition = { ServiceName: { $ne: "" } };
    if (tendentId) {
      condition.tendentId = mongoose.Types.ObjectId(tendentId);
    }
    const names = await productModel.distinct("ServiceName", condition);
    return names.filter(Boolean);
  } catch (error) {
    console.log(error);
    return [];
  }
};
