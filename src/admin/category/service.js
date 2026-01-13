const CategoryModal = require("../../models/categoryModel");
const mongoose = require('mongoose');

exports.AddCategory = async (req, res, _id) => {
    try {
        res.locals.message = req.flash();
        if (req.query?.EditId) {
            if (req.file != undefined && req.file) {
                req.body.image = req.file.filename
            }
            if (req.query.id != "" && req.query.id != undefined) {
                req.body.parent_Name = mongoose.Types.ObjectId(req.query.id)
            }
            await CategoryModal.findByIdAndUpdate(req.query.EditId, req.body)
        } else {
            if (req.file) {
                req.body.image = req.file.filename
            } else {
                req.body.image = ""
            }

            if (req.query.id) {
                req.body.parent_Name = mongoose.Types.ObjectId(req.query.id)
            } else {
                req.body.parent_Name = null
            }
            const data = await CategoryModal.create(req.body)
            req.flash("success", "Category Added Successfully !");
        }
        
        res.redirect("/view-category")
    } catch (error) {
        console.log(error)
    }
}
