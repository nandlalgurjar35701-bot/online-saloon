const mongoose = require("mongoose");
const teamMemberModel = require("../../models/teamMemberModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const str = String(value || "").toLowerCase();
  return str === "true" || str === "1" || str === "on";
};

exports.getTeamMemberById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return teamMemberModel.findById(id).lean();
};

exports.getTeamMembers = async (query = {}) => {
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

  return teamMemberModel
    .find(condition)
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
};

exports.saveTeamMember = async ({ body = {}, file = null }) => {
  const payload = {
    name: String(body.name || "").trim(),
    role: String(body.role || "").trim(),
    bio: String(body.bio || "").trim(),
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
    status: normalizeBoolean(body.status),
  };

  if (!payload.name) {
    throw new Error("Team member name is required.");
  }

  if (!payload.role) {
    throw new Error("Team member role is required.");
  }

  if (file?.filename) {
    payload.image = file.filename;
  }

  if (body.id && isValidObjectId(body.id)) {
    return teamMemberModel.findByIdAndUpdate(body.id, payload, { new: true });
  }

  return teamMemberModel.create(payload);
};

exports.deleteTeamMemberById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return teamMemberModel.findByIdAndDelete(id);
};

