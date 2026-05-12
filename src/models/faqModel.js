const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  question: {
    type: String,
    default: ""
  },
  answer: {
    type: String,
    default: ""
  },
  tendentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("FAQ", userSchema);