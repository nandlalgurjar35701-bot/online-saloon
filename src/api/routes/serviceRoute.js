const { Router } = require("express");
const responseHandler = require("../../utils/responseHandlers");
const auth = require("../../middleware/auth");
const Upload = require("../../middleware/img");
const controller = require('../controller/serviceController');
const { register, otpSent, otpVerify, login, loginOtpVerify, userEditProfile, user_Profile, logOut, EditUserProfile } = require('../controller/controller');
const app = Router();
app.get("/service", controller.servicePage);
app.get("/services", controller.servicePage);

app.get("/price", controller.pricePage);
app.get("/pricing", controller.pricePage);
app.get("/team", controller.teamPage);
app.get("/testimonial", controller.testimonialPage);
app.get("/gallery", controller.galleryPage);
app.get("/appointment", controller.appointmentPage);
app.get("/contact", controller.contactPage);
app.get("/404", controller.notFoundPage);

// app.get("/about", controller.servicePage)

module.exports = app;
