const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

const saloon_Service = new mongoose.Schema({
    ServiceName: {
        type: String,
        default: ""
    },
    ServicePrice: {
        type: Number,
        default: 0
    },
    timePeriod_in_minits: {
        type: Number,
        default: 15
    },
    type: {
        type: String,
        default: ""
    },
    image: {
        type: [String],
        default: null
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: ObjectId,
        default: null
    },
    Services: {
        type: [ObjectId],
        default: null
    },
    FinalPrice: {
        type: Number,
        default: 0
    },
    ServicesType: {
        type: Number,
        default: 0
    }
}, { versionKey: false, timestamps: true });


module.exports = new mongoose.model("saloonService", saloon_Service);