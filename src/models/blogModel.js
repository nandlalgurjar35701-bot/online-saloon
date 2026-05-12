const mongoose = require("mongoose");

const Blog = new mongoose.Schema({
    category: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    Title: {
        type: String,
    },
    image: {
        type: [String],
    },
    WriterName: {
        type: String,
    },
    WriteDate: {
        type: String
    },
    Description: {
        type: String,
    },
    tendentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
}, { timestamps: true, versionKey: false });


const blog = new mongoose.model("blog", Blog);
module.exports = blog;


