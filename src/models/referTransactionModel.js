const mongoose = require("mongoose");

const ConvertTra = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        // default: null
    },
    referPlanId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const referTransaction = new mongoose.model("referTransaction", ConvertTra);
module.exports = referTransaction;


