const mongoose = require("mongoose");
const { getCategoryListing } = require("../../api/category/controller");
const productModel = require("../../models/productModel");
const productPackageService = require("../service/productPackageService");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.addProductPackagePage = async (req, res) => {
  try {
    res.locals.message = req.flash();
    let productPackageData;

    if (req.query.id && isValidObjectId(req.query.id)) {
      productPackageData = await productModel.findOne({ _id: req.query.id });
      if (productPackageData) {
        req.query.saloonId = productPackageData.saloonStore;
        req.query.id = productPackageData.category?.[0];
      }
    } else {
      req.query.id = "";
    }

    req.query.type = 1;
    const Category = await getCategoryListing(req);
    const salon = await productPackageService.findStoreOptions(req);

    return res.render("productPackage/add-product-package", {
      user: req.user,
      data: productPackageData,
      salon,
      Category,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load product package form.");
    return res.redirect("/view-product-package");
  }
};

exports.createOrUpdateProductPackage = async (req, res) => {
  try {
    await productPackageService.saveProductPackage(req);
    return res.redirect("/view-product-package");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to save product package.");
    return res.redirect("/add-product-package");
  }
};

exports.viewProductPackagePage = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = await productPackageService.getProductPackageList(req);
    return res.render("productPackage/view-product-package", {
      query: req.query,
      user: req.user,
      data,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load product packages.");
    return res.redirect("/");
  }
};

exports.deleteProductPackage = async (req, res) => {
  try {
    if (!req.query.id || !isValidObjectId(req.query.id)) {
      req.flash("error", "Invalid package id.");
      return res.redirect("/view-product-package");
    }

    await productModel.findByIdAndDelete({ _id: mongoose.Types.ObjectId(req.query.id) });
    return res.redirect("/view-product-package");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete product package.");
    return res.redirect("/view-product-package");
  }
};

exports.findServicesForProductPackage = async (req, res) => {
  try {
    const data = await productPackageService.findServicesForPackage(req.query.saloonId);
    return res.send(data);
  } catch (error) {
    console.log(error);
    return res.send([]);
  }
};

exports.findProductPackageServices = async (req, res) => {
  try {
    const data = await productPackageService.findPackageServices(req.query.id);
    return res.send(data);
  } catch (error) {
    console.log(error);
    return res.send([]);
  }
};
