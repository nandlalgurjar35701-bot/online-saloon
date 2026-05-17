const auth = require("../../middleware/adminauth");
const { Router } = require("express");
const app = Router();
const faqController = require("../controller/faqController");

app.get("/add-frequent", auth, faqController.renderFaqForm);
app.post("/add-frequent-data", auth, faqController.saveFaq);
app.get("/view-frequent", auth, faqController.renderFaqList);
app.get("/delete-frequent", auth, faqController.deleteFaq);
app.get("/view-frequent-answer", auth, faqController.viewFaqAnswer);


module.exports = app;
