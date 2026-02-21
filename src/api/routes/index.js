const serviceController = require("../controller/serviceController");

module.exports = (app) => {
    app.use(require("./userRoute"));
    app.use(require("./serviceRoute"));
    app.use(serviceController.notFoundPage);
};
