const faqService = require("../service/faqService");

exports.renderFaqForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.headers['tendentId']) {
      req.query.tendentId = req.headers['tendentId'];
    }
    const faqData = req.query.id ? await faqService.getFaqById(req.query.id) : null;
    const findBlog = await faqService.getBlogOptions(req.query.id, req.query);
    const blogOptions = findBlog.length > 0 ? findBlog : await faqService.getBlogOptions(null, req.query);

    return res.render("add_frequent/add_frequent", {
      user: req.user,
      faqData,
      Findblog: blogOptions,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load FAQ form.");
    return res.redirect("/admin/view-frequent");
  }
};

exports.saveFaq = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.headers['tendentId']) {
      req.body.tendentId = req.headers['tendentId'];
    }
    await faqService.saveFaq(req.body);
    req.flash("success", "FAQ saved successfully.");
    return res.send({ status: true });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save FAQ.");
    return res.status(400).send({ status: false, message: error.message });
  }
};

exports.renderFaqList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.headers['tendentId']) {
      req.query.tendentId = req.headers['tendentId'];
    }
    const data = await faqService.getFaqList(req.query);
    return res.render("add_frequent/view_frequent", { user: req.user, data });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load FAQs.");
    return res.redirect("/admin/");
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const deleted = await faqService.deleteFaqById(req.query.id);
    if (!deleted) {
      req.flash("error", "FAQ not found.");
      return res.redirect("/admin/view-frequent");
    }

    req.flash("success", "FAQ deleted successfully.");
    return res.redirect("/admin/view-frequent");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete FAQ.");
    return res.redirect("/admin/view-frequent");
  }
};

exports.viewFaqAnswer = async (req, res) => {
  try {
    const data = await faqService.getFaqAnswerById(req.query.id);
    return res.send(data ? [data] : []);
  } catch (error) {
    console.log(error);
    return res.send([]);
  }
};
