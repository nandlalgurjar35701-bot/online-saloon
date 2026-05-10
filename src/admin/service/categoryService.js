const CategoryModal = require("../../models/categoryModel");
const mongoose = require('mongoose');

const normalizeCategoryType = (value) => {
    if (value === "productpackage" || value === "1" || value === 1) {
        return "productpackage";
    }
    return "product";
};

exports.AddCategory = async (req, res, _id) => {
    try {
        res.locals.message = req.flash();
        if (req.query?.EditId) {
            if (req.file != undefined && req.file) {
                req.body.image = req.file.filename;
            }
            if (req.query.id != "" && req.query.id != undefined) {
                req.body.parent_Name = mongoose.Types.ObjectId(req.query.id);
                const parentCategory = await CategoryModal.findById(req.query.id).lean();
                if (parentCategory) {
                    req.body.type = normalizeCategoryType(parentCategory.type);
                }
            } else {
                req.body.type = normalizeCategoryType(req.body.type);
            }
            await CategoryModal.findByIdAndUpdate(req.query.EditId, req.body);
            req.flash("success", "Category Updated Successfully !");
        } else {
            if (req.file) {
                req.body.image = req.file.filename;
            } else {
                req.body.image = "";
            }

            if (req.query.id) {
                req.body.parent_Name = mongoose.Types.ObjectId(req.query.id);
                const parentCategory = await CategoryModal.findById(req.query.id).lean();
                req.body.type = normalizeCategoryType(parentCategory?.type);
            } else {
                req.body.parent_Name = null;
                req.body.type = normalizeCategoryType(req.body.type);
            }
            await CategoryModal.create(req.body);
            req.flash("success", "Category Added Successfully !");
        }

        res.redirect("/admin/view-category");
    } catch (error) {
        console.log(error);
    }
};
