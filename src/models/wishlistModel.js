const mongoose = require("mongoose");
const userWishlist = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId
    },
    saloonId: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    productId: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

}, { timestamps: true, versionKey: false });


const wishlist = new mongoose.model("wishlist", userWishlist);
module.exports = wishlist;
