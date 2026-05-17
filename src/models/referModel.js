const mongoose = require("mongoose");

const refers = new mongoose.Schema({
    rupee: {
        type: Number,
        default: 0
    },
    point: {
        type: Number,
        default: 0
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const refer = new mongoose.model("refer", refers);
module.exports = refer;


