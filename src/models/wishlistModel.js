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

}, { timestamps: true });


const wishlist = new mongoose.model("wishlist", userWishlist);
module.exports = wishlist;
