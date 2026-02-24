const appServices = require("../services/appServices");
const Appointment = require("../../models/appointmentModel");
const Contact = require("../../models/contactUsModel");
const Newsletter = require("../../models/newsletterModel");

const renderWithData = async (res, viewName, statusCode = 200) => {
  const data = await appServices.index();
  return res.status(statusCode).render(viewName, { data });
};

exports.servicePage = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = 9;
    const data = await appServices.index({ includeProducts: false });
    const paginatedProducts = await appServices.getPaginatedProducts({ page, limit });

    data.products = paginatedProducts.items;
    data.pagination = {
      currentPage: paginatedProducts.currentPage,
      totalPages: paginatedProducts.totalPages,
      totalItems: paginatedProducts.totalItems,
      limit: paginatedProducts.limit,
      hasPrev: paginatedProducts.hasPrev,
      hasNext: paginatedProducts.hasNext,
    };

    return res.status(200).render("service", { data });
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.pricePage = async (req, res) => {
  try {
    return await renderWithData(res, "price");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.teamPage = async (req, res) => {
  try {
    return await renderWithData(res, "team");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.testimonialPage = async (req, res) => {
  try {
    return await renderWithData(res, "testimonial");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.galleryPage = async (req, res) => {
  try {
    return await renderWithData(res, "gallery");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.appointmentPage = async (req, res) => {
  try {
    return await renderWithData(res, "appointment");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.contactPage = async (req, res) => {
  try {
    return await renderWithData(res, "contact");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.profilePage = async (req, res) => {
  try {
    return await renderWithData(res, "profile");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.wishlistPage = async (req, res) => {
  try {
    return await renderWithData(res, "wishlist");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.ordersPage = async (req, res) => {
  try {
    return await renderWithData(res, "orders");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.cartPage = async (req, res) => {
  try {
    const data = await appServices.index();
    return res.render("cart", { data, razorpayKey: process.env.key_id || "" });
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { name, email, phone, service, date, message } = req.body;
    if (!name || !phone || !service || !date) {
      req.flash("error", "Name, phone, service and date are required.");
      return res.redirect("/appointment");
    }

    await Appointment.create({
      name,
      email: email || "",
      phone,
      service,
      date,
      message: message || "",
    });

    req.flash("success", "Appointment request submitted successfully.");
    return res.redirect("/appointment");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to submit appointment right now.");
    return res.redirect("/appointment");
  }
};

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, services, message } = req.body;
    if (!name || !email || !phone || !message) {
      req.flash("error", "Please fill all required contact fields.");
      return res.redirect("/contact");
    }

    const alreadyPending = await Contact.findOne({
      status: 0,
      $or: [{ email }, { phone }],
    });
    if (alreadyPending) {
      req.flash("error", "Your previous contact request is already pending.");
      return res.redirect("/contact");
    }

    await Contact.create({
      name,
      email,
      phone,
      services: services || "",
      message,
    });

    req.flash("success", "Contact request sent successfully.");
    return res.redirect("/contact");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to send contact request right now.");
    return res.redirect("/contact");
  }
};

exports.createNewsletter = async (req, res) => {
  try {
    const redirectTo = req.get("referer") || "/";
    const { email } = req.body;
    if (!email) {
      req.flash("error", "Email is required for newsletter signup.");
      return res.redirect(redirectTo);
    }

    const alreadySubscribed = await Newsletter.findOne({ email });
    if (!alreadySubscribed) {
      await Newsletter.create({ email });
    }

    req.flash("success", "Newsletter subscription successful.");
    return res.redirect(redirectTo);
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to subscribe right now.");
    return res.redirect(req.get("referer") || "/");
  }
};

exports.notFoundPage = async (req, res) => {
  try {
    return await renderWithData(res, "404", 404);
  } catch (error) {
    console.log(error);
    return res.status(404).render("404");
  }
};
