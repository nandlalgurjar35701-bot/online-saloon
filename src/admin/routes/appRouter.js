const auth = require("../../middleware/adminauth")
const Upload = require("../../middleware/img");
const responseHandler = require("../../utils/responseHandlers");
const { Router } = require("express");
const app = Router();
const bannerController = require('../controller/bannerController');

app.get("/home-banners", auth, bannerController.homeBanners);
app.get("/add-banner", auth, bannerController.addBanner);
app.post("/uplode-banner", auth, Upload.single("image"), bannerController.uplodeBanner);
app.get("/delete_banner", auth, bannerController.deleteBanner);

module.exports = app
