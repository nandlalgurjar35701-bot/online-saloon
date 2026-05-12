const mongoose = require("mongoose");

const Safety = new mongoose.Schema({
    Title: {
        type: String,
    },
    Amount: {
        type: Number,
    },
    CouponCode: {
        type: String,
    },
    StartDate: {
        type: String
    },
    EndDate: {
        type: String

    },
    Limit: {
        type: Number
    },
    Discount: {
        type: Number,
        default: "0"
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const SafetyProgram = new mongoose.model("SafetyProgram", Safety);
module.exports = SafetyProgram;
