const aboutModel = require('../../models/aboutModel')

exports.about = async ({ query }, res) => {
    try {
        let data = null
        if (query.id) {
            data = await aboutModel.findById(query.id);
        }
        res.render("app/add_about", { user: {}, data, query })
    } catch (error) {
        console.log(error);
    }
}


exports.viewAbout = async (req, res) => {
    try {
        let data = await aboutModel.find()
        res.render("app/view_about", { user: {}, data, query: req.query })
    } catch (error) {
        console.log(error);
    }
}

exports.createAbout = async ({ body, query }, res) => {
    try {
        console.log(body, '----body', query)

        let data = {};
        if (body.id) {
            data = await aboutModel.findByIdAndUpdate(body.id, body);
        } else {
            data = await aboutModel.create(body);
        }

        return res.redirect("/view-about");
    } catch (err) {
        console.log(err);
    };
};

exports.deleteAbout = async ({ query }, res) => {
    try {
        data = await aboutModel.findByIdAndDelete(query.id);
        return res.redirect("/view-about");
    } catch (err) {
        console.log(err);
    };
};
