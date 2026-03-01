const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "+01234567890",
    },
    email: {
      type: String,
      default: "info@example.com",
    },
    address: {
      type: String,
      default: "123 Salon Street, New Delhi",
    },
    mapEmbedUrl: {
      type: String,
      default: "",
    },
    newsletterDescription: {
      type: String,
      default: "Get salon updates, offers and grooming tips straight to your inbox.",
    },
    openingHours: {
      monFri: {
        type: String,
        default: "09:00 AM - 09:00 PM",
      },
      saturday: {
        type: String,
        default: "09:00 AM - 08:00 PM",
      },
      sunday: {
        type: String,
        default: "10:00 AM - 06:00 PM",
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
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("sitesetting", siteSettingSchema);
