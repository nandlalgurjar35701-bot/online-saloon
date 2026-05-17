const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    tendentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("gallery", gallerySchema);
