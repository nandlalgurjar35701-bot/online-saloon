const testimonialService = require("../service/testimonialService");

exports.renderTestimonialForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = req.query.id
      ? await testimonialService.getTestimonialById(req.query.id)
      : null;

    if (req.query.id && !data) {
      req.flash("error", "Testimonial not found.");
      return res.redirect("/admin/view-testimonial");
    }

    return res.render("app/add_testimonial", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to open testimonial form.");
    return res.redirect("/admin/view-testimonial");
  }
};

exports.renderTestimonialList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.user?.tendentId) {
      req.query.tendentId = req.user.tendentId;
    }
    const data = await testimonialService.getTestimonials(req.query);
    return res.render("app/view_testimonial", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load testimonials.");
    return res.redirect("/admin/");
  }
};

exports.saveTestimonial = async (req, res) => {
  try {
    if (req.user?.tendentId) {
      req.body.tendentId = req.user.tendentId;
    }
    await testimonialService.saveTestimonial({ body: req.body, file: req.file });
    req.flash("success", "Testimonial saved successfully.");
    return res.redirect("/admin/view-testimonial");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save testimonial.");
    return res.redirect(req.body?.id ? `/testimonial?id=${req.body.id}` : "/testimonial");
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const deleted = await testimonialService.deleteTestimonialById(req.query.id);
    if (!deleted) {
      req.flash("error", "Testimonial not found.");
      return res.redirect("/admin/view-testimonial");
    }

    req.flash("success", "Testimonial deleted successfully.");
    return res.redirect("/admin/view-testimonial");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete testimonial.");
    return res.redirect("/admin/view-testimonial");
  }
};

