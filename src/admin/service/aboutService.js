const mongoose = require("mongoose");
const aboutModel = require("../../models/aboutModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAboutById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return aboutModel.findById(id).lean();
};

exports.getAboutList = async (query = {}) => {
  const condition = {};

  if (query.title && String(query.title).trim()) {
    condition.title = { $regex: String(query.title).trim(), $options: "i" };
  }

  return aboutModel.find(condition).sort({ createdAt: -1 }).lean();
};

exports.saveAbout = async (body = {}) => {
  const payload = {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
  };

  if (!payload.title) {
    throw new Error("About title is required.");
  }

  if (!payload.description) {
    throw new Error("About description is required.");
  }

  if (body.id && isValidObjectId(body.id)) {
    return aboutModel.findByIdAndUpdate(body.id, payload, { new: true });
  }

  return aboutModel.create(payload);
};

exports.deleteAboutById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return aboutModel.findByIdAndDelete(id);
};
