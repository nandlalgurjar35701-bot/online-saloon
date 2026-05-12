const mongoose = require("mongoose");

const Transaction = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId
    },
    moneyType: {
        type: String
    },
    type: {
        type: String
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    fromUserId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    tragactionId: {
        type: Number
    },
    amount: {
        type: Number
    },
    status: {
        type: String
    },
    description: {
        type: String
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const walletTransaction = new mongoose.model("walletTransaction", Transaction);
module.exports = walletTransaction;


