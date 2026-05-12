const mongoose = require("mongoose");
const productModel = require("../../models/productModel");
const productPackageModel = require("../../models/productPackageModel");
const saloonModel = require("../../models/saloonStoreModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const getNormalizedRole = (value) => String(value || "").toLowerCase();

exports.findServicesForPackage = async (saloonId, reqUser) => {
  if (!isValidObjectId(saloonId)) return [];
  const match = {
    saloonStore: mongoose.Types.ObjectId(saloonId),
  };

  if (getNormalizedRole(reqUser?.type) === "admin") {
    const ownedStore = await saloonModel.findOne({
      _id: mongoose.Types.ObjectId(saloonId),
      userId: reqUser?._id,
    }).select({ _id: 1 });

    if (!ownedStore) return [];
  }

  return productModel.find(match);
};

exports.findStoreOptions = async (req) => {
  const match = {};
  if (getNormalizedRole(req.user?.type) === "admin") {
    match.userId = req.user?._id;
  }
  if (req.user?.tendentId) {
    match.tendentId = mongoose.Types.ObjectId(req.user.tendentId);
  }

  if (req.query.saloonId && isValidObjectId(req.query.saloonId)) {
    match._id = mongoose.Types.ObjectId(req.query.saloonId);
  }

  return saloonModel
    .find(match, { _id: 1, storeName: 1 })
    .sort({ storeName: 1 })
    .lean();
};

exports.saveProductPackage = async (req) => {
  const body = { ...req.body };
  if (req.user?.tendentId) {
    body.tendentId = req.user.tendentId;
  }
  const isEdit = req.query.id && isValidObjectId(req.query.id);

  if (!body.ServiceName || !String(body.ServiceName).trim()) {
    throw new Error("Package name is required.");
  }
  if (!body.saloonStore || !isValidObjectId(body.saloonStore)) {
    throw new Error("Please select a valid saloon.");
  }
  if (!body.category || !isValidObjectId(body.category)) {
    throw new Error("Please select a valid category.");
  }

  const selectedServices = Array.isArray(body.Services)
    ? body.Services
    : body.Services
      ? [body.Services]
      : [];

  body.Services = selectedServices
    .map((item) => {
      try {
        const parsed = JSON.parse(item);
        return parsed?.id || null;
      } catch (error) {
        return item;
      }
    })
    .filter((item) => isValidObjectId(item));

  if (body.Services.length === 0) {
    throw new Error("Please select at least one product.");
  }

  body.saloonStore = mongoose.Types.ObjectId(body.saloonStore);

  if (getNormalizedRole(req.user?.type) === "admin") {
    const ownedStore = await saloonModel.findOne({
      _id: body.saloonStore,
      userId: req.user?._id,
    }).select({ _id: 1 });
    if (!ownedStore) {
      throw new Error("You are not allowed to use this saloon.");
    }
  }

  body.category = mongoose.Types.ObjectId(body.category);
  body.ServicePrice = Number(body.ServicePrice || 0);
  body.FinalPrice = Number(body.FinalPrice || 0);
  body.timePeriod_in_minits = Number(body.timePeriod_in_minits || 0);

  if (req.file?.filename) body.image = [req.file.filename];
  else if (!isEdit) body.image = [];

  if (isEdit) {
    return productPackageModel.findByIdAndUpdate(
      mongoose.Types.ObjectId(req.query.id),
      body,
      { new: true }
    );
  }

  return productPackageModel.create(body);
};

exports.getProductPackageList = async (req) => {
  const pipeline = [];
  const match = {};

  if (req.query.ServicePrice) match.ServicePrice = { $gt: Number(req.query.ServicePrice) };
  if (req.query.ServiceName) match.ServiceName = { $regex: req.query.ServiceName, $options: "i" };
  if (req.query.FinalPrice) match.FinalPrice = { $gt: Number(req.query.FinalPrice) };
  if (req.query.id && isValidObjectId(req.query.id)) {
    match.saloonStore = mongoose.Types.ObjectId(req.query.id);
  }
  if (req.user?.tendentId) {
    match.tendentId = mongoose.Types.ObjectId(req.user.tendentId);
  }

  pipeline.push({ $match: match });

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
  pipeline.push({ $unwind: { path: "$last_category_data", preserveNullAndEmptyArrays: true } });
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

  return productPackageModel.aggregate(pipeline);
};

exports.findPackageServices = async (id) => {
  if (!isValidObjectId(id)) return [];
  return productPackageModel.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "products",
        localField: "Services",
        foreignField: "_id",
        as: "Services",
      },
    },
    { $unwind: { path: "$Services" } },
    { $replaceRoot: { newRoot: "$Services" } },
  ]);
};
