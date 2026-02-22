const faqService = require("./services");

exports.renderFaqForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const faqData = req.query.id ? await faqService.getFaqById(req.query.id) : null;
    const findBlog = await faqService.getBlogOptions(req.query.id);
    const blogOptions = findBlog.length > 0 ? findBlog : await faqService.getBlogOptions();

    return res.render("add_frequent/add_frequent", {
      user: req.user,
      faqData,
      Findblog: blogOptions,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load FAQ form.");
    return res.redirect("/view-frequent");
  }
};

exports.saveFaq = async (req, res) => {
  try {
    res.locals.message = req.flash();
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
    const data = await faqService.getFaqList(req.query);
    return res.render("add_frequent/view_frequent", { user: req.user, data });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load FAQs.");
    return res.redirect("/");
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const deleted = await faqService.deleteFaqById(req.query.id);
    if (!deleted) {
      req.flash("error", "FAQ not found.");
      return res.redirect("/view-frequent");
    }

    req.flash("success", "FAQ deleted successfully.");
    return res.redirect("/view-frequent");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete FAQ.");
    return res.redirect("/view-frequent");
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

// Backward-compatible aliases
exports.ADD_FREQUENT = exports.renderFaqForm;
exports.ADD_FREQUENT_DATA = exports.saveFaq;
exports.VIEW_FREQUENT = exports.renderFaqList;
exports.DELETE_FREQUENT = exports.deleteFaq;
exports.ViwesFindQustion = exports.viewFaqAnswer;
