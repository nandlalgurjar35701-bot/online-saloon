const auth = require("../../middleware/adminauth");
const Upload = require("../../middleware/img");
const { Router } = require("express");
const app = Router();
const controller = require("../controller/galleryController");

app.get("/gallery-config", auth, controller.renderGalleryForm);
app.get("/view-gallery-config", auth, controller.renderGalleryList);
app.post("/gallery-config-save", auth, Upload.single("image"), controller.saveGallery);
app.get("/delete-gallery-config", auth, controller.deleteGallery);

module.exports = app;
