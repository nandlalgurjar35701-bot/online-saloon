const appServices = require("../services/appServices");
const Appointment = require("../../models/appointmentModel");
const Contact = require("../../models/contactUsModel");
const Newsletter = require("../../models/newsletterModel");

const renderWithData = async (req, res, viewName, statusCode = 200) => {
  const tendentId = req.headers.tendentId;
  const data = await appServices.index({ tendentId });
  return res.status(statusCode).render(viewName, { data, tendentId });
};

exports.servicePage = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const q = String(req.query.q || "").trim();
    const categoryId = String(req.query.categoryId || "").trim();
    const limit = 9;
    const tendentId = req.headers.tendentId;
    const data = await appServices.index({ includeProducts: false, tendentId });
    const paginatedProducts = await appServices.getPaginatedProducts({ page, limit, q, categoryId, tendentId });

    data.products = paginatedProducts.items;
    data.filters = { q, categoryId };
    data.pagination = {
      currentPage: paginatedProducts.currentPage,
      totalPages: paginatedProducts.totalPages,
      totalItems: paginatedProducts.totalItems,
      limit: paginatedProducts.limit,
      hasPrev: paginatedProducts.hasPrev,
      hasNext: paginatedProducts.hasNext,
    };

    return res.status(200).render("service", { data, tendentId });
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.pricePage = async (req, res) => {
  try {
    return await renderWithData(req, res, "price");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.teamPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "team");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.testimonialPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "testimonial");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.galleryPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "gallery");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.appointmentPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "appointment");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.contactPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "contact");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.profilePage = async (req, res) => {
  try {
    return await renderWithData(req, res, "profile");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.wishlistPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "wishlist");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.ordersPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "orders");
  } catch (error) {
    console.log(error);
    return res.status(500).render("404");
  }
};

exports.cartPage = async (req, res) => {
  try {
    const tendentId = req.headers.tendentId;
    const data = await appServices.index({ tendentId });
    return res.render("cart", { data, tendentId, razorpayKey: process.env.key_id || "" });
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
      tendentId: req.headers.tendentId
    });

    return res.status(201).json({
      status: true,
      message: "Appointment request submitted successfully."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Unable to submit appointment right now."
    });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, services, message } = req.body;
    if (!name || !email || !phone || !message) {
      req.flash("error", "Please fill all required contact fields.");
      return res.redirect("/contact");
    }

    const tendentId = req.headers.tendentId;
    const alreadyPending = await Contact.findOne({
      status: 0,
      tendentId,
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
      tendentId
    });

    return res.status(201).json({
      status: true,
      message: "Contact request sent successfully."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Unable to send contact request right now."
    });
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

    const tendentId = req.headers.tendentId;
    const alreadySubscribed = await Newsletter.findOne({ email, tendentId });
    if (!alreadySubscribed) {
      await Newsletter.create({ email, tendentId });
    }

    return res.status(201).json({
      status: true,
      message: "Newsletter subscription successful."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Unable to subscribe right now."
    });
  }
};

exports.notFoundPage = async (req, res) => {
  try {
    return await renderWithData(req, res, "404", 404);
  } catch (error) {
    console.log(error);
    return res.status(404).render("404");
  }
};
