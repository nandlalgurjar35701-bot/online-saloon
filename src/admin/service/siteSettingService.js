const mongoose = require("mongoose");
const siteSettingModel = require("../../models/siteSettingModel");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const str = String(value || "").toLowerCase();
  return str === "true" || str === "1" || str === "on";
};

exports.getSiteSettingById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return siteSettingModel.findById(id).lean();
};

exports.getSiteSettingList = async (query = {}) => {
  const condition = {};

  if (query.brandName && String(query.brandName).trim()) {
    condition.brandName = { $regex: String(query.brandName).trim(), $options: "i" };
  }

  if (query.email && String(query.email).trim()) {
    condition.email = { $regex: String(query.email).trim(), $options: "i" };
  }

  if (typeof query.status !== "undefined" && query.status !== "") {
    condition.status = normalizeBoolean(query.status);
  }

  return siteSettingModel.find(condition).sort({ createdAt: -1 }).lean();
};

exports.saveSiteSetting = async (body = {}) => {
  const payload = {
    brandName: String(body.brandName || "").trim(),
    phone: String(body.phone || "").trim(),
    email: String(body.email || "").trim(),
    address: String(body.address || "").trim(),
    mapEmbedUrl: String(body.mapEmbedUrl || "").trim(),
    openingHours: {
      monFri: String(body.openingHoursMonFri || "").trim(),
      saturday: String(body.openingHoursSaturday || "").trim(),
      sunday: String(body.openingHoursSunday || "").trim(),
    },
    socialLinks: {
      facebook: String(body.socialFacebook || "").trim(),
      instagram: String(body.socialInstagram || "").trim(),
      twitter: String(body.socialTwitter || "").trim(),
      linkedin: String(body.socialLinkedin || "").trim(),
    },
    status: normalizeBoolean(body.status),
  };

  if (!payload.brandName) {
    throw new Error("Brand name is required.");
  }

  if (body.id && isValidObjectId(body.id)) {
    return siteSettingModel.findByIdAndUpdate(body.id, payload, { new: true });
  }

  return siteSettingModel.create(payload);
};

exports.deleteSiteSettingById = async (id) => {
  if (!isValidObjectId(id)) return null;
  return siteSettingModel.findByIdAndDelete(id);
};
