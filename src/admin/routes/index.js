// const adminRoutes = require("./admin1/route");


// const add_saloone = require("./add_saloon/routes");
// const add_service = require("./add_service/routes");
// const add_frequent = require("./add_frequent/routes");
// const order = require("./order/route")
// const add_blog = require("./blog/routes");
// const Counpon = require("./Coupon/route");
// const payment = require("./payment/route");
// const category = require("./category/routes");
// const user = require("./users/route");
// const Artists = require("./Artists/routes");
// const Vacancy = require("./Vacancy/routes");
// const refer = require("./Refer-And-point/routes");
// const Contact = require("./Contact-us/route");
// const package = require("./servicePackage/route");
// const newsletters = require("./newLetter/routes");

// module.exports = [adminRoutes, add_saloone, add_service,
//     add_frequent, order, add_blog, category, Counpon, payment,
//     user, Artists, Vacancy, refer, Contact, package, newsletters]





module.exports = (app) => {
    app.use(require("../admin1/route"));
    app.use(require("./appRouter"));
    app.use(require("./aboutRouter"));
    app.use(require("../add_service/routes"));
    app.use(require("../add_frequent/routes"));
    app.use(require("../order/route"));
    app.use(require("../blog/routes"));
    app.use(require("../Coupon/route"));
    app.use(require("../payment/route"));
    app.use(require("../category/routes"));
    app.use(require("../users/route"));
    app.use(require("../Artists/routes"));
    app.use(require("../Vacancy/routes"));
    app.use(require("../Refer-And-point/routes"));
    app.use(require("../Contact-us/route"));
    app.use(require("../servicePackage/route"));
    app.use(require("../newLetter/routes"));
    //   app.use(`${apiV1Prefix}/user`, require('./userRoutes'));
};