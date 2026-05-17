const mongoose = require("mongoose");
const galleryModel = require("../../models/galleryModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const str = String(value || "").toLowerCase();
  return str === "true" || str === "1" || str === "on";
};

exports.getGalleryById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return galleryModel.findById(id).lean();
};

exports.getGalleryList = async (query = {}) => {
  const condition = {};

  if (query.title && String(query.title).trim()) {
    condition.title = { $regex: String(query.title).trim(), $options: "i" };
  }

  if (query.category && String(query.category).trim()) {
    condition.category = { $regex: String(query.category).trim(), $options: "i" };
  }

  if (typeof query.status !== "undefined" && query.status !== "") {
    condition.status = normalizeBoolean(query.status);
  }

  if (query.tendentId) {
    condition.tendentId = query.tendentId;
  }

  return galleryModel.find(condition).sort({ sortOrder: 1, createdAt: -1 }).lean();
};

exports.saveGallery = async ({ body = {}, file = null }) => {
  const payload = {
    title: String(body.title || "").trim(),
    category: String(body.category || "").trim(),
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
    status: normalizeBoolean(body.status),
    tendentId: body.tendentId || null,
  };

  if (!payload.title) {
    throw new Error("Gallery title is required.");
  }

  if (file?.filename) {
    payload.image = file.filename;
  }

  if (body.id && isValidObjectId(body.id)) {
    return galleryModel.findByIdAndUpdate(body.id, payload, { new: true });
  }

  if (!payload.image) {
    throw new Error("Gallery image is required.");
  }

  return galleryModel.create(payload);
};

exports.deleteGalleryById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return galleryModel.findByIdAndDelete(id);
};
