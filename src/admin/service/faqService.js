const mongoose = require("mongoose");
const faqModel = require("../../models/faqModel");
const blogModel = require("../../models/blogModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getBlogOptions = async (blogId, query = {}) => {
  const condition = {};
  if (blogId && isValidObjectId(blogId)) {
    condition._id = mongoose.Types.ObjectId(blogId);
  }
  if (query && query.tendentId) {
    condition.tendentId = query.tendentId;
  }
  return blogModel.find(condition).sort({ createdAt: -1 }).lean();
};

exports.getFaqById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return faqModel.findById(id).lean();
};

exports.saveFaq = async (body = {}) => {
  const question = String(body.question || "").trim();
  const answer = String(body.answer || "").trim();
  const blogId = body.blogId;

  if (!question) throw new Error("Question is required.");
  if (!answer) throw new Error("Answer is required.");
  if (!blogId || !isValidObjectId(blogId)) throw new Error("Valid blog is required.");

  const payload = {
    question,
    answer,
    blogId: mongoose.Types.ObjectId(blogId),
    tendentId: body.tendentId || null,
  };

  if (body.faqData && isValidObjectId(body.faqData)) {
    return faqModel.findByIdAndUpdate(body.faqData, payload, { new: true });
  }

  return faqModel.create(payload);
};

exports.getFaqList = async (query = {}) => {
  const pipeline = [];
  const match = {};
  if (query.id && isValidObjectId(query.id)) {
    match.blogId = mongoose.Types.ObjectId(query.id);
  }
  if (query.tendentId) {
    match.tendentId = mongoose.Types.ObjectId(query.tendentId);
  }
  pipeline.push({ $match: match });

  pipeline.push(
    {
      $lookup: {
        from: "blogs",
        localField: "blogId",
        foreignField: "_id",
        as: "blogs",
      },
    },
    {
      $addFields: {
        blogTitel: {
          $getField: {
            field: "Title",
            input: { $arrayElemAt: ["$blogs", 0] },
          },
        },
      },
    },
    { $sort: { _id: -1 } }
  );

  return faqModel.aggregate(pipeline);
};

exports.deleteFaqById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return faqModel.findByIdAndDelete(id);
};

exports.getFaqAnswerById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return faqModel.findById(id).lean();
};
