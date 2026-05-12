const mongoose = require("mongoose");
const newsletters = require("../../models/newsletterModel");
const user = require("../../models/userModel");
const saloon = require("../../models/saloonStoreModel");
const ContecUs = require("../../models/contactUsModel");

exports.sendNotification = async (req, res) => {
    try {
        res.locals.message = req.flash();
        let data
        const condition = { _id: req.query.id };
        if (req.user?.tendentId) {
            condition.tendentId = req.user.tendentId;
        }
        if (req.query.id != undefined && req.query.id != "") {
            data = await ContecUs.findOne(condition)
        }

        res.render("newsletters/index", { user: req.user, data });
    } catch (error) {
        console.log(error);
    };
};

const { newLetterEmail } = require("../../middleware/mail");

exports.SendAllUserEmail = async (req, res) => {
    try {
        let arr;
        const condition = {};
        if (req.user?.tendentId) {
            condition.tendentId = req.user.tendentId;
        }
        const newsletterData = await newsletters.distinct("email", condition);
        const userData = await user.distinct("email", condition);
        const saloonData = await saloon.distinct("email", condition);
        if (req.body.status == 0) {
            arr = [...newsletterData, ...userData, ...saloonData];
            arr.flat(2);
        } else if (req.body.status == 1) {
            arr = saloonData;
        } else if (req.body.status == 2) {
            arr = userData;
        } else if (req.body.status == 3) {
            arr = newsletterData;
        };
        if (req.query.ContectUs != undefined && req.query.ContectUs != "") {
            const data = await ContecUs.findOne({ _id: req.query.ContectUs })
            arr = [data.email]
        }
        req.arr = arr;
        const result = await newLetterEmail(req);

        if (result.statusCode == 200) {
            const data = await ContecUs.findByIdAndUpdate({ _id: req.query.ContectUs }, { status: 1 }, { new: true })
            req.flash("success", "mail send  successfully");
            res.redirect("/admin/");
        };
    } catch (error) {
        console.log(error);
    };
};



