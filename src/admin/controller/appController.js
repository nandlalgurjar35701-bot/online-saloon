const homeBannerModel = require('../../models/homeBannerModel')

exports.homeBanners = async (req, res) => {
    try {
        let data = await homeBannerModel.find()
        res.render("app/homeBanner", { user: {}, data, Findblog: [] })
    } catch (error) {
        console.log(error);
    }
}

exports.addBanner = async ({ user, query }, res) => {
    try {
        let data = {};
        if (query.id) {
            data = await homeBannerModel.findById(query.id);
        }

        res.render("app/add_banner", { user, data });
    } catch (err) {
        console.log(err);
    };
};



exports.uplodeBanner = async (req, res) => {
    try {
        res.locals.message = req.flash();
        if (req.file?.filename) {
            req.body.image = req.file.filename;
        }
        console.log(req.body, "---------")
        if (req.body.id) {
            await homeBannerModel.findByIdAndUpdate(req.body.id, req.body);
            req.flash("success", "Question's Answer update succesfully");
        } else {
            await homeBannerModel.create(req.body);
            req.flash("success", "Question's Answer add succesfully");
        }
        res.redirect('/home-banners')
    } catch (err) {
        console.log(err);
    };
};



exports.deleteBanner = async ({ query }, res) => {
    try {
        const data = await homeBannerModel.findByIdAndDelete(query.id);
        res.redirect('/home-banners')
    } catch (err) {
        console.log(err);
    };
};