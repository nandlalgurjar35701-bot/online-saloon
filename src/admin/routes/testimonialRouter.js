const auth = require("../../middleware/adminauth");
const Upload = require("../../middleware/img");
const { Router } = require("express");
const app = Router();
const controller = require("../controller/testimonialController");

app.get("/testimonial", auth, controller.renderTestimonialForm);
app.get("/view-testimonial", auth, controller.renderTestimonialList);
app.post("/testimonial-save", auth, Upload.single("image"), controller.saveTestimonial);
app.get("/delete-testimonial", auth, controller.deleteTestimonial);

module.exports = app;

