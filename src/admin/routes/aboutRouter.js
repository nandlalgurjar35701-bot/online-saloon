const auth = require("../../middleware/adminauth");
const { Router } = require("express");
const app = Router();
const controller = require("../controller/aboutController");

app.get("/about", auth, controller.renderAboutForm);
app.get("/view-about", auth, controller.renderAboutList);

app.post("/add-about-store", auth, controller.saveAbout);
app.get("/delete-about", auth, controller.deleteAbout);


module.exports = app;
