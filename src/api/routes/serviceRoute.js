const { Router } = require("express");
const responseHandler = require("../../utils/responseHandlers");
const auth = require("../../middleware/auth");
const Upload = require("../../middleware/img");
const controller = require('../controller/serviceController');
const { register, otpSent, otpVerify, login, loginOtpVerify, userEditProfile, user_Profile, logOut, EditUserProfile } = require('../controller/controller');
const app = Router();
app.get("/service", controller.servicePage);

app.get("/price", controller.pricePage);

// app.get("/about", controller.servicePage)

module.exports = app;