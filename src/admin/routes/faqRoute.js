const auth = require("../../middleware/adminauth");
const { Router } = require("express");
const app = Router();
const {
  renderFaqForm,
  saveFaq,
  renderFaqList,
  deleteFaq,
  viewFaqAnswer,
} = require("../controller/faqController");

app.get("/add-frequent", auth, renderFaqForm);
app.post("/add-frequent-data", auth, saveFaq);
app.get("/view-frequent", auth, renderFaqList);
app.get("/delete-frequent", auth, deleteFaq);
app.get("/view-frequent-answer", auth, viewFaqAnswer);

// Backward-compatible routes
app.get("/add_frequent", auth, renderFaqForm);
app.post("/addfrequentdata", auth, saveFaq);
app.get("/view_frequent", auth, renderFaqList);
app.get("/delete_frequent", auth, deleteFaq);
app.get("/Viwes-Find-Qustion", auth, viewFaqAnswer);

module.exports = app;
