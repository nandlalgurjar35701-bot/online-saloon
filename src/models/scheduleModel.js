const mongoose = require("mongoose");

const schedul = new mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId
    },
    saloonId: {
        type: mongoose.Types.ObjectId
    },
    cartId: {
        type: mongoose.Types.ObjectId
    },
    date: {
        type: String,
    },
    timeslot: {
        type: String,
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });

const schedule = new mongoose.model("schedule", schedul);
module.exports = schedule;
