const category = require("../../models/categoryModel");
const vacancy = require("../../models/vacancyModel");
const mongoose = require("mongoose")
const service = require("./services")
const { getCategoryListing } = require("../../api/category/controller")
const { findAllProductName } = require("../controller/productController");
const seloonservice = require("../../models/productModel")
const store = require("../../models/saloonStoreModel");
const { query } = require("express");

exports.Vacancy = async (req, res) => {
    try {
        res.locals.message = req.flash();
        let data;
        const { query, ...rest } = req
        const condition = { parent_Name: null };
        if (req.user?.tendentId) {
            req.query.tendentId = req.user.tendentId;
            condition.tendentId = req.user.tendentId;
        }
        const FindCategory_data = await category.find(condition)
        const services = await findAllProductName(req.user?.tendentId)
        if (req.query.id != undefined && req.query.id != "") {
            data = await vacancy.findOne({ _id: req.query.id })
        }

        res.render("vacancy/index", {
            user: req.user,
            data,
            category_data: FindCategory_data,
            services
        })
    } catch (error) {
        console.log(error)
    }

}

exports.FindserviceforAdmin = async (req, res) => {
    try {
        const data = await seloonservice.find({ category: { $in: mongoose.Types.ObjectId(req.query.id) } })
        res.send(data)
    } catch (error) {
        console.log(error)
    }
}

exports.addVacency = async (req, res) => {
    try {
        if (req.user?.tendentId) {
            req.body.tendentId = req.user.tendentId;
        }
        let city = [];
        if (req.body.requiredStatus == "All") {
            const FindSaloon = await store.find()
            for (const item of FindSaloon) {
                if (item.location.city) {
                    if (city.includes(item.location.city) == false) {
                        city.push(item.location.city)
                    };
                };
            };
            req.body.city = city;
        } else {
            req.body.city = req.body.requiredSaloon;
        };
        req.body.userId = req.user._id;

        if (req.query.id != undefined && req.query.id != "") {
            const result = await vacancy.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id) })
            if (result) {
                res.redirect("/admin/View-Vacancy");
            };
        } else {
            const vacancyDitail = new vacancy(req.body);
            const result = await vacancyDitail.save();
            if (result) {
                res.redirect("/admin/View-Vacancy");
            };


        }


    } catch (error) {
        console.log(error);
    };
};

exports.ViewVacancy = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const data = await service.ViewVacancy(req)


        res.render("vacancy/viwe-vacancy", { user: req.user, data, query: req.query })
    } catch (error) {
        console.log(error);
    };
};


exports.findVacancy = async (req, res) => {
    try {
        const data = await service.ViewVacancy(req)
        res.send(data)
    } catch (error) {
        console.log(error);
    };
};

exports.deletVacancy = async (req, res) => {
    try {
        const data = await vacancy.findByIdAndDelete({ _id: req.query.id })
        if (data) {
            res.redirect("/admin/View-Vacancy")
        }
    } catch (error) {
        console.log(error);
    };
};
