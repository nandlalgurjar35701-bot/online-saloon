const mongoose = require("mongoose");
const blogModel = require("../../models/blogModel");
const categoryModel = require("../../models/categoryModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getBlogCategoryOptions = async () => {
  return categoryModel
    .find({ parent_Name: null, type: { $in: ["product", 0, "0", null] } })
    .sort({ Name: 1 })
    .lean();
};

exports.getBlogById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return blogModel.findById(id).lean();
};

exports.saveBlog = async ({ body, file, query }) => {
  const payload = {};

  if (!body?.Title || !String(body.Title).trim()) {
    throw new Error("Blog title is required.");
  }
  if (!body?.WriterName || !String(body.WriterName).trim()) {
    throw new Error("Writer name is required.");
  }
  if (!body?.WriteDate || !String(body.WriteDate).trim()) {
    throw new Error("Write date is required.");
  }
  if (!body?.description || !String(body.description).trim()) {
    throw new Error("Description is required.");
  }
  if (!body?.category || !isValidObjectId(body.category)) {
    throw new Error("Valid category is required.");
  }

  payload.Title = String(body.Title).trim();
  payload.WriterName = String(body.WriterName).trim();
  payload.WriteDate = String(body.WriteDate).trim();
  payload.Description = String(body.description).trim();
  payload.category = mongoose.Types.ObjectId(body.category);

  if (file?.filename) {
    payload.image = [file.filename];
  }

  if (query?.id && isValidObjectId(query.id)) {
    return blogModel.findByIdAndUpdate(query.id, payload, { new: true });
  }

  if (!payload.image) {
    payload.image = [];
  }
  return blogModel.create(payload);
};

exports.getBlogList = async (query = {}) => {
  const match = {};
  if (query.Category && isValidObjectId(query.Category)) {
    match.category = mongoose.Types.ObjectId(query.Category);
  }
  if (query.WriterName) {
    match.WriterName = query.WriterName;
  }
  if (query.Title) {
    match.Title = { $regex: query.Title, $options: "i" };
  }

  const pipeline = [{ $match: match }];
  pipeline.push(
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "result",
      },
    },
    {
      $lookup: {
        from: "faqs",
        localField: "_id",
        foreignField: "blogId",
        pipeline: [{ $count: "count" }],
        as: "faq",
      },
    },
    {
      $addFields: {
        category_name: {
          $getField: {
            field: "Name",
            input: { $arrayElemAt: ["$result", 0] },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } }
  );

  return blogModel.aggregate(pipeline);
};

exports.getBlogWriterOptions = async () => {
  const names = await blogModel.distinct("WriterName", { WriterName: { $ne: "" } });
  return names.filter(Boolean);
};

exports.deleteBlogById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return blogModel.findByIdAndDelete(id);
};

exports.getBlogDescriptionById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return blogModel.findById(id).lean();
};
