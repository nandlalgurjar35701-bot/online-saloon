const auth = require("../../middleware/adminauth");
const { Router } = require("express");
const app = Router();
const controller = require("../controller/siteSettingController");

app.get("/site-setting-config", auth, controller.renderSiteSettingForm);
app.get("/view-site-setting-config", auth, controller.renderSiteSettingList);
app.post("/site-setting-config-save", auth, controller.saveSiteSetting);
app.get("/delete-site-setting-config", auth, controller.deleteSiteSetting);

module.exports = app;
