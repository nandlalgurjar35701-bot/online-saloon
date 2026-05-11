const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema({
  brandName: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  mapEmbedUrl: {
    type: String,
    default: "",
  },
  newsletterDescription: {
    type: String,
    default: "",
  },
  openingHours: {
    monFri: {
      type: String,
      default: "",
    },
    saturday: {
      type: String,
      default: "",
    },
    sunday: {
      type: String,
      default: "",
    },
  },
  socialLinks: {
    facebook: { type: String, default: "#" },
    instagram: { type: String, default: "#" },
    twitter: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
  },
  status: {
    type: Boolean,
    default: true,
  },
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model("sitesetting", siteSettingSchema);
