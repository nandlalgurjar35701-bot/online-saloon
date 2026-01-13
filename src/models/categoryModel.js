const mongoose = require("mongoose");

const add_Category = new mongoose.Schema({
    parent_Name: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    Name: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    }
}, { versionKey: false, timestamps: true });


const category = new mongoose.model("category", add_Category);
module.exports = category;


