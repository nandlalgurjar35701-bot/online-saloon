const mongoose = require("mongoose");

const pricePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  durationLabel: {
    type: String,
    default: "/Session",
  },
  features: {
    type: [String],
    default: [],
  },
  ctaLabel: {
    type: String,
    default: "Book Now",
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  status: {
    type: Boolean,
    default: true,
  },
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model("priceplan", pricePlanSchema);
