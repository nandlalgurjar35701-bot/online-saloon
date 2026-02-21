
const { AddCategory } = require("./service");
const CategoryModule = require("../../models/categoryModel");
const mongoose = require('mongoose');

exports.Category = async (req, res) => {
    try {
        res.locals.message = req.flash();
        if (req.query.id) {
            res.render("category/index", { user: req.user, id: req.query.id })
        } else if (req.query.EditId) {
            if (!mongoose.Types.ObjectId.isValid(req.query.EditId)) {
                req.flash("error", "Invalid category id.");
                return res.redirect("/view-category");
            }

            const findData = await CategoryModule.findOne({ _id: mongoose.Types.ObjectId(req.query.EditId) });
            if (!findData) {
                req.flash("error", "Category not found.");
                return res.redirect("/view-category");
            }

            res.render("category/index", { user: req.user, data: findData })
        } else {
            res.render("category/index", { user: req.user })
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to load category page.");
        return res.redirect("/view-category");
    }
}

exports.AddCategory = async (req, res) => {
    try {
        await AddCategory(req, res)
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to save category.");
        return res.redirect("/view-category");
    }
}

exports.ViwesCategory = async (req, res) => {
    try {
        res.locals.message = req.flash();

        let condition = {}
        if (req.query.CategoryName != undefined && req.query.CategoryName != "") {
            condition = { Name: { $regex: req.query.CategoryName, $options: 'i' } };
        } else if (req.query.id != undefined && req.query.id != "") {
            condition = { parent_Name: req.query.id };
        } else if (req.query.status != undefined && req.query.status != "") {
            condition = {}
        } else {
            condition = { parent_Name: null };
        }
        if (req.query.type != undefined && req.query.type != "") {
            condition.type = Number(req.query.type)
        }

        let data = await CategoryModule.find(condition)

        let dele;
        for (const item of data) {
            const FindData = await CategoryModule.find({ parent_Name: item._id })

            if (FindData.length > 0) { dele = `view` } else { dele = `delete` }

            item._doc.del = dele
            dele = ""
        }
        if (data) {
            res.render("category/view-category", { query: req.query, data, user: req.user })
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to load categories.");
        return res.redirect("/");
    }
}


exports.DeleteCategory = async (req, res) => {
    try {
        res.locals.message = req.flash();

        if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
            req.flash("error", "Invalid category id.");
            return res.redirect("/view-category");
        }

        const hasChildren = await CategoryModule.exists({ parent_Name: mongoose.Types.ObjectId(req.query.id) });
        if (hasChildren) {
            req.flash("error", "Please delete sub categories first.");
            return res.redirect("/view-category");
        }

        const result = await CategoryModule.findByIdAndRemove({ _id: mongoose.Types.ObjectId(req.query.id) });
        if (result) {
            req.flash("success", "Category Delete Succesfully !")
            return res.redirect("/view-category")
        } else {
            req.flash("error", "Category not found.");
            return res.redirect("/view-category")
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to delete category.");
        return res.redirect("/view-category");
    }
}
