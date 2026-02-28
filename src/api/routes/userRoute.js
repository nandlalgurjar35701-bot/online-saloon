const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const responseHandler = require("../../utils/responseHandlers");
const auth = require("../../middleware/auth");
const Upload = require("../../middleware/img");
const controller = require('../controller/controller');
const { register, otpSent, otpVerify, login, loginOtpVerify, userEditProfile, user_Profile, logOut, EditUserProfile } = require('../controller/controller');
const app = Router();

app.get("/get-site-config", (req, res) => {
    try {
        const configPath = path.join(__dirname, "../data/static-site-config.json");
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        res.json({ status: true, data: config });
    } catch (err) {
        res.status(500).json({ status: false, message: "Config not found" });
    }
});

app.get("/", controller.index);

app.post("/otp-sent", responseHandler(otpSent));
app.post("/otp-verify", responseHandler(otpVerify));
app.post("/register", responseHandler(register));

app.post("/login", responseHandler(login));
app.post("/login-otp-verify", responseHandler(loginOtpVerify));

app.post("/user-Edit-Profile", auth, Upload.single("file"), responseHandler(userEditProfile));
app.get("/user-Profile", auth, responseHandler(user_Profile));
app.get("/log-Out", responseHandler(logOut));

app.post("/Edit-User-Profile", auth, Upload.single("file"), responseHandler(EditUserProfile))
app.get("/about", controller.about)

module.exports = app;