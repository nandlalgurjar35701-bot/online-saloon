const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  bio: {
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
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model("teammember", teamMemberSchema);
