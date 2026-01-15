const saloon = require("../../api/saloonstore/model");
const Category = require("../../models/categoryModel")
const saloonService = require("../../api/saloonService/model")
const mongoose = require("mongoose");
const service = require("./service")
const { getAllSaloonCity } = require("../../api/saloonstore/controller")

exports.ADD_SERVICE = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const user = req.user
        const category = await Category.find()
        let service_data = null;
        if (req.query.id) service_data = await saloonService.findById(req.query.id);
        res.render("add_service/add_service", { user, category, service_data, query: req.query })
    } catch (err) {
        console.log(err)
    }
}



exports.optiongeturl = async (req, res) => {
    try {
        const parent_id = req.query.select
        if (parent_id != undefined && parent_id.length == 24) {
            const _id = mongoose.Types.ObjectId(parent_id)

            const sub_category = await Category.find({ parent_Name: _id })
            const userdata = []
            sub_category.forEach((index) => {
                userdata.push({
                    "_id": index._id,
                    "Name": index.Name,
                    "parent_Name": index.parent_Name,
                });
            });
            res.send(userdata);

        }
    } catch (error) {
        console.log(error)
    }
}

exports.ADD_SERVICE_STORE = async (req, res) => {
    try {
        res.locals.message = req.flash();
        let { body, files, query } = req;
        if (files.length > 0) {
            body.image = files.map((element) => element.filename);
        };

        if (query.id) {
            await saloonService.findByIdAndUpdate(query.id, req.body);
            req.flash("success", "Saloon Service  is  Update Successfully !");
            return res.redirect("/view_service");
        }

        await saloonService.create(req.body);
        req.flash("success", "Service Add Succesfuuly !")
        return res.redirect("/view_service")
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("/");
    };
};

exports.VIEW_SERVICE = async (req, res) => {
    try {
        res.locals.message = req.flash();
        const data = await service.VIEW_SALOON(req)
        const user = req.user
        return res.render("add_service/view_service", { query: req.query, user, data })
    } catch (error) {
        console.log(error);
    }
}

exports.DELETE_SERVICE = async (req, res) => {
    const id = req.query.id
    await saloonService.findByIdAndDelete({ _id: id })
    res.redirect("/view_service")
}

exports.FindAllServiceName = async (req) => {
    let arr = []
    const findData = await saloonService.find()

    for (const item of findData) {
        if (item.ServiceName != "" && item.ServiceName != undefined) {
            if (arr.includes(item.ServiceName) == false) {
                arr.push(item.ServiceName)
            }
        }
    }

    if (arr.length > 0) {
        return arr;
    }

}
exports.findSallon = async (req, res) => {
    try {
        const data = await saloon.findOne({ _id: mongoose.Types.ObjectId(req.query.id) }, { type: 1, storeName: 1 })
        res.send(data)
    } catch (error) {
        console.log(error)
    }
}