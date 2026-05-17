const mongoose = require("mongoose");

const Artist = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    skiils: {
        type: [String],
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

}, { timestamps: true, versionKey: false });


const artist = new mongoose.model("artist", Artist);
module.exports = artist;


