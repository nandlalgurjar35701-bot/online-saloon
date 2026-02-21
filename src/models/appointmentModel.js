const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    service: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "cancelled", "completed"],
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("appointment", appointmentSchema);
