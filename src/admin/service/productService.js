const productModel = require("../../models/productModel");
const mongoose = require("mongoose");

exports.fetchProductList = async (req) => {
  const pipeline = [];
  const match = {};

  if (req.query.ServicePrice !== undefined && req.query.ServicePrice !== "") {
    match.ServicePrice = { $gt: Number(req.query.ServicePrice) };
  }

  if (req.query.ServiceName !== undefined && req.query.ServiceName !== "") {
    match.ServiceName = { $regex: req.query.ServiceName };
  }

  if (req.query.id !== undefined && req.query.id !== "") {
    if (mongoose.Types.ObjectId.isValid(req.query.id)) {
      match.saloonStore = mongoose.Types.ObjectId(req.query.id);
    }
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

  return productModel.aggregate(pipeline);
};
