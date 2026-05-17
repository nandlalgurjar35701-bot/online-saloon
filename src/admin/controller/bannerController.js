const homeBannerModel = require('../../models/homeBannerModel');
const mongoose = require("mongoose");

exports.homeBanners = async (req, res) => {
    try {
        let filter = {};
        if (req.headers['tendentId']) {
            filter.tendentId = req.headers['tendentId']
        }
        const data = await homeBannerModel.find(filter).sort({ createdAt: -1 });
        res.locals.message = req.flash();
        return res.render("app/homeBanner", { user: req.user, data, Findblog: [] });
    } catch (error) {
        console.log(error);
        req.flash("error", "Unable to load banners.");
        return res.redirect("/admin/");
    }
};

exports.addBanner = async (req, res) => {
    try {
        const { user, query } = req;
        res.locals.message = req.flash();
        let data = {};
        if (query.id) {
            if (!mongoose.Types.ObjectId.isValid(query.id)) {
                req.flash("error", "Invalid banner id.");
                return res.redirect("/admin/home-banners");
            }
            data = await homeBannerModel.findById(query.id);
            if (!data) {
                req.flash("error", "Banner not found.");
                return res.redirect("/admin/home-banners");
            }
        }

        return res.render("app/add_banner", { user, data });
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to open banner form.");
        return res.redirect("/admin/home-banners");
    }
};

exports.uplodeBanner = async (req, res) => {
    try {
        res.locals.message = req.flash();
        if (req.file?.filename) {
            req.body.image = req.file.filename;
        }
        if (req.body.id) {
            if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
                req.flash("error", "Invalid banner id.");
                return res.redirect('/admin/home-banners');
            }

            const updated = await homeBannerModel.findByIdAndUpdate(req.body.id, req.body, { runValidators: true });
            if (!updated) {
                req.flash("error", "Banner not found.");
                return res.redirect('/admin/home-banners');
            }
            req.flash("success", "Banner updated successfully.");
        } else {
            if (!req.body.image) {
                req.flash("error", "Banner image is required.");
                return res.redirect('/admin/add-banner');
            }
            req.body.tendentId = req.headers['tendentId'];
            await homeBannerModel.create(req.body);
            req.flash("success", "Banner added successfully.");
        }
        return res.redirect('/admin/home-banners');
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to save banner.");
        return res.redirect('/admin/home-banners');
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { query } = req;
        if (!mongoose.Types.ObjectId.isValid(query.id)) {
            req.flash("error", "Invalid banner id.");
            return res.redirect('/admin/home-banners');
        }

        const data = await homeBannerModel.findByIdAndDelete(query.id);
        if (!data) {
            req.flash("error", "Banner not found.");
            return res.redirect('/admin/home-banners');
        }

        req.flash("success", "Banner deleted successfully.");
        return res.redirect('/admin/home-banners');
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to delete banner.");
        return res.redirect('/admin/home-banners');
    }
};
