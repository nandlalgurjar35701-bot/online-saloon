const mongoose = require("mongoose");

const city = new mongoose.Schema({
    State: {
        type: String
    },
    District: {
        type: String
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const citys = new mongoose.model("city", city);
module.exports = citys;


