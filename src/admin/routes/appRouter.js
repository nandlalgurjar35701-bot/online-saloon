const auth = require("../../middleware/adminauth")
const Upload = require("../../middleware/img");
const responseHandler = require("../../utils/responseHandlers");
const { Router } = require("express");
const app = Router();
const bannerController = require('../controller/bannerController');

app.get("/home-banners", auth, bannerController.homeBanners);
// app.post("/register-admin-data", adminRegisterData);

app.get("/add-banner", auth, bannerController.addBanner);
app.post("/uplode-banner", auth, Upload.single("image"), bannerController.uplodeBanner);
app.get("/delete_banner", auth, bannerController.deleteBanner);
// app.post("/login-admin-data", loginData);

// app.get("/forget-password", auth, forgetPassword)
// app.post("/Forget-password", auth, ForgetPassword)
// app.get("/users-profile", auth, usersProfile);
// app.post("/add_profile_data", auth, Upload.single("image"), add_profile_data)

// app.get("/Admin-log-out", AdminlogOut)

// // ajex
// app.get("/payment-Revenues", auth, paymentRevenues)

module.exports = app
