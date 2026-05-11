const { string } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  phone: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "user"
  },
  dateOfBirth: {
    type: Date,
    default: ""
  },
  password: {
    type: String
  },
  image: {
    type: String,
    default: ""
  },
  verify: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },

  referalDetails: {
    referalAmount: {
      type: Number
    },
    referaType: {
      type: String
    }
  },

  auth: {
    type: String,
    default: ""
  },
  referCode: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  referId: {
    type: mongoose.Types.ObjectId,
    default: null
  }
}, { timestamps: true });






module.exports = mongoose.model("admin", userSchema);