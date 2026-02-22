const { Router } = require("express");
const controller = require('../controller/serviceController');
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
app.get("/my-profile", controller.profilePage);
app.get("/my-wishlist", controller.wishlistPage);
app.get("/my-orders", controller.ordersPage);
app.get("/404", controller.notFoundPage);
app.post("/appointment", controller.createAppointment);
app.post("/contact", controller.createContact);
app.post("/newsletter", controller.createNewsletter);

module.exports = app;
