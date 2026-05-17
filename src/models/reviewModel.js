const mongoose = require("mongoose");

const reviews = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
    },
    saloonId: {
        type: mongoose.Types.ObjectId,
    },
    Rating: {
        type: Number,
    },
    Date: {
        type: String,
    },
    Description: {
        type: String,
    },
    like: {
        type: [mongoose.Types.ObjectId],

    },
    dislike: {
        type: [mongoose.Types.ObjectId],

    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const review = new mongoose.model("review", reviews);
module.exports = review;


