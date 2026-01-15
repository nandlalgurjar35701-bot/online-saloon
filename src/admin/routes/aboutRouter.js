const auth = require("../../middleware/adminauth")
const Upload = require("../../middleware/img");
const responseHandler = require("../../utils/responseHandlers");
const { Router } = require("express");
const app = Router();
const controller = require('../controller/aboutController');

app.get("/about", auth, controller.about);
app.get("/view-about", auth, controller.viewAbout);

app.post("/add_about_store", auth, controller.createAbout);
// app.post("/uplode-banner", auth, Upload.single("image"), controller.uplodeBanner);
app.get("/delete-About", auth,  controller.deleteAbout);

module.exports = app