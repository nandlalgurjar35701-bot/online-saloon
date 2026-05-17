const mongoose = require("mongoose");

const letter = new mongoose.Schema({
    email: {
        type: String
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

}, { timestamps: true, versionKey: false });


const Newsletter = new mongoose.model("Newsletter", letter);
module.exports = Newsletter;


