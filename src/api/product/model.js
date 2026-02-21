const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const productSchema = new mongoose.Schema(
  {
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
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: ObjectId,
      default: null,
    },
    Services: {
      type: [ObjectId],
      default: null,
    },
    FinalPrice: {
      type: Number,
      default: 0,
    },
    ServicesType: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "saloonservices",
  }
);

module.exports = mongoose.models.product || mongoose.model("product", productSchema);
