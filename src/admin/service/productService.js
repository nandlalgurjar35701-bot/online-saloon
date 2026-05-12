const productModel = require("../../models/productModel");
const mongoose = require("mongoose");
const getNormalizedRole = (value) => String(value || "").toLowerCase();

exports.fetchProductList = async (req) => {
  const pipeline = [];
  const match = {};

  if (req.query.ServicePrice !== undefined && req.query.ServicePrice !== "") {
    match.ServicePrice = { $gt: Number(req.query.ServicePrice) };
  }

  if (req.query.ServiceName !== undefined && req.query.ServiceName !== "") {
    match.ServiceName = { $regex: req.query.ServiceName, $options: "i" };
  }

  if (req.query.id !== undefined && req.query.id !== "") {
    if (mongoose.Types.ObjectId.isValid(req.query.id)) {
      match.saloonStore = mongoose.Types.ObjectId(req.query.id);
    }
  }

  if (req.user?.tendentId) {
    match.tendentId = mongoose.Types.ObjectId(req.user.tendentId);
  }

  pipeline.push({ $match: match });
  pipeline.push({
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category",
    },
  });
  pipeline.push({
    $unwind: {
      path: "$category",
      preserveNullAndEmptyArrays: true,
    },
  });
  pipeline.push({
    $lookup: {
      from: "saloons",
      localField: "saloonStore",
      foreignField: "_id",
      as: "saloon_data",
    },
  });

  if (getNormalizedRole(req.user?.type) === "admin") {
    pipeline.push({
      $match: { "saloon_data.userId": req.user._id },
    });
  }

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

  if (req.query.CategoryName !== undefined && req.query.CategoryName !== "") {
    pipeline.push({
      $match: { "category.Name": { $regex: req.query.CategoryName, $options: "i" } },
    });
  }

  if (req.query.StoreName !== undefined && req.query.StoreName !== "") {
    pipeline.push({
      $match: { saloon_name: { $regex: req.query.StoreName, $options: "i" } },
    });
  }

  return productModel.aggregate(pipeline);
};
