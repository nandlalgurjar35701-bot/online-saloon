const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
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
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model("testimonial", testimonialSchema);
