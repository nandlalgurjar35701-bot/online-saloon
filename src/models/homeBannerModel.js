const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    heading: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model("homebanner", userSchema);