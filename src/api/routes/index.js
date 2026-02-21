module.exports = (app) => {
    app.use(require("./userRoute"));
    app.use(require("./serviceRoute"));
    app.use((req, res) => {
        return res.status(404).render("404");
    });
};
