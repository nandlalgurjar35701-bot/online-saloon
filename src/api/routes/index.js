module.exports = (app) => {
    app.use(require("./userRoute"));
    app.use(require("./serviceRoute"));
};
