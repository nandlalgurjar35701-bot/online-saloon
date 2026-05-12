const mongoose = require("mongoose");

const productPackageSchema = new mongoose.Schema({
  ServiceName: {
    type: String,
    default: "",
  },
  ServicePrice: {
    type: Number,
    default: 0,
  },
  timePeriod_in_minits: {
    type: Number,
    default: 15,
  },
  type: {
    type: String,
    default: "",
  },
  image: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  saloonStore: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  Services: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  FinalPrice: {
    type: Number,
    default: 0,
  },
  tendentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
}, { versionKey: false, timestamps: true, });

module.exports = mongoose.model("productPackage", productPackageSchema);
