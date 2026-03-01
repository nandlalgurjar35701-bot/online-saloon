const serviceController = require("../controller/serviceController");

module.exports = (app) => {
    app.use(require("./userRoute"));
    app.use(require("./serviceRoute"));
    app.use(require("../cart/route"));
    app.use(require("../order/route"));
    app.use(require("../user-wishlist/route"));
    app.use(require("../payment/route"));
    app.use(require("../Schedule/route"));
    app.all("*", serviceController.notFoundPage);
};
