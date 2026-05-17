const mongoose = require("mongoose");
const testimonialModel = require("../../models/testimonialModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const str = String(value || "").toLowerCase();
  return str === "true" || str === "1" || str === "on";
};

exports.getTestimonialById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return testimonialModel.findById(id).lean();
};

exports.getTestimonials = async (query = {}) => {
  const condition = {};

  if (query.name && String(query.name).trim()) {
    condition.name = { $regex: String(query.name).trim(), $options: "i" };
  }

  if (query.role && String(query.role).trim()) {
    condition.role = { $regex: String(query.role).trim(), $options: "i" };
  }

  if (typeof query.status !== "undefined" && query.status !== "") {
    condition.status = normalizeBoolean(query.status);
  }

  if (query.tendentId) {
    condition.tendentId = query.tendentId;
  }

  return testimonialModel
    .find(condition)
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
};

exports.saveTestimonial = async ({ body = {}, file = null }) => {
  const ratingNum = Number.parseInt(body.rating, 10);
  const payload = {
    name: String(body.name || "").trim(),
    role: String(body.role || "").trim(),
    message: String(body.message || "").trim(),
    rating: Number.isFinite(ratingNum) ? Math.min(Math.max(ratingNum, 1), 5) : 5,
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
    status: normalizeBoolean(body.status),
    tendentId: body.tendentId || null,
  };

  if (!payload.name) {
    throw new Error("Client name is required.");
  }

  if (!payload.role) {
    throw new Error("Client role is required.");
  }

  if (!payload.message) {
    throw new Error("Testimonial message is required.");
  }

  if (file?.filename) {
    payload.image = file.filename;
  }

  if (body.id && isValidObjectId(body.id)) {
    return testimonialModel.findByIdAndUpdate(body.id, payload, { new: true });
  }

  return testimonialModel.create(payload);
};

exports.deleteTestimonialById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return testimonialModel.findByIdAndDelete(id);
};

