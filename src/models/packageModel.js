const mongoose = require("mongoose");

const packages = new mongoose.Schema({
    PackageName: {
        type: String
    },
    saloonId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    PackageCotegory: {
        type: mongoose.Types.ObjectId
    },
    Services: {
        type: [mongoose.Types.ObjectId],
    },
    Amount: {
        type: Number,
    },
    finalPrice: {
        type: Number,
    },
    ServicesTime: {
        type: String
    },
    packagesType: {
        type: Number
    },
    gender: {
        type: String
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const package = new mongoose.model("package", packages);
module.exports = package;


