const mongoose = require("mongoose");

const coupons = new mongoose.Schema({
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
}, { timestamps: true, versionKey: false });


const coupon = new mongoose.model("coupon", coupons);
module.exports = coupon;
