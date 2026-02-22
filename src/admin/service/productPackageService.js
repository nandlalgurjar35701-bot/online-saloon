const mongoose = require("mongoose");
const productModel = require("../../models/productModel");
const saloonModel = require("../../models/saloonStoreModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.findServicesForPackage = async (saloonId) => {
  if (!isValidObjectId(saloonId)) return [];
  return productModel.find({
    saloonStore: mongoose.Types.ObjectId(saloonId),
    ServicesType: 0,
  });
};

exports.findStoreOptions = async (req) => {
  const pipeline = [];

  if (req.query.saloonId && isValidObjectId(req.query.saloonId)) {
    pipeline.push({
      $match: { _id: mongoose.Types.ObjectId(req.query.saloonId) },
    });
  }

  if (req.user.type === "admin") {
    pipeline.push({
      $match: { userId: mongoose.Types.ObjectId(req.user._id) },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "saloonservices",
        localField: "_id",
        foreignField: "saloonStore",
        as: "ss",
      },
    },
    { $unwind: { path: "$ss" } },
    {
      $group: {
        _id: "$_id",
        fieldN: { $first: { _id: "$_id", storeName: "$storeName" } },
      },
    },
    { $replaceRoot: { newRoot: "$fieldN" } }
  );

  return saloonModel.aggregate(pipeline);
};

exports.saveProductPackage = async (req) => {
  const body = { ...req.body };
  const selectedServices = Array.isArray(body.Services)
    ? body.Services
    : body.Services
      ? [body.Services]
      : [];

  body.Services = selectedServices.map((item) => JSON.parse(item).id);
  if (req.file?.filename) body.image = req.file.filename;
  body.ServicesType = 1;

  if (req.query.id && isValidObjectId(req.query.id)) {
    return productModel.findByIdAndUpdate(
      mongoose.Types.ObjectId(req.query.id),
      body,
      { new: true }
    );
  }

  return productModel.create(body);
};

exports.getProductPackageList = async (req) => {
  const pipeline = [];
  const match = { ServicesType: 1 };

  if (req.query.ServicePrice) match.ServicePrice = { $gt: Number(req.query.ServicePrice) };
  if (req.query.ServiceName) match.ServiceName = { $regex: req.query.ServiceName, $options: "i" };
  if (req.query.FinalPrice) match.FinalPrice = { $gt: Number(req.query.FinalPrice) };
  if (req.query.id && isValidObjectId(req.query.id)) {
    match.saloonStore = mongoose.Types.ObjectId(req.query.id);
  }

  pipeline.push({ $match: match });

  if (req.user.type === "admin") {
    pipeline.push({
      $lookup: {
        from: "saloons",
        localField: "saloonStore",
        foreignField: "_id",
        pipeline: [{ $match: { userId: req.user._id } }],
        as: "saloon_data",
      },
    });
  } else {
    pipeline.push({
      $lookup: {
        from: "saloons",
        localField: "saloonStore",
        foreignField: "_id",
        as: "saloon_data",
      },
    });
  }

  const categoryLookup =
    req.query.CategoryName && req.query.CategoryName !== ""
      ? {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          pipeline: [{ $match: { Name: { $regex: req.query.CategoryName, $options: "i" } } }],
          as: "last_category_data",
        }
      : {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "last_category_data",
        };

  pipeline.push({ $lookup: categoryLookup });
  pipeline.push({ $unwind: { path: "$last_category_data" } });
  pipeline.push({
    $addFields: {
      saloon_name: {
        $getField: {
          field: "storeName",
          input: { $arrayElemAt: ["$saloon_data", 0] },
        },
      },
    },
  });

  if (req.query.StoreName) {
    pipeline.push({
      $match: { saloon_name: { $regex: req.query.StoreName, $options: "i" } },
    });
  }

  if (req.user.type === "admin") {
    pipeline.push({ $match: { saloon_name: { $exists: true } } });
  }

  return productModel.aggregate(pipeline);
};

exports.findPackageServices = async (id) => {
  if (!isValidObjectId(id)) return [];
  return productModel.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "saloonservices",
        localField: "Services",
        foreignField: "_id",
        as: "Services",
      },
    },
    { $unwind: { path: "$Services" } },
    { $replaceRoot: { newRoot: "$Services" } },
  ]);
};
