const mongoose = require("mongoose");

const model = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { versionKey: false, timestamps: true });

module.exports = new mongoose.model("about", model);



