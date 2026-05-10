const aboutService = require("../service/aboutService");

exports.renderAboutForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = req.query.id ? await aboutService.getAboutById(req.query.id) : null;

    if (req.query.id && !data) {
      req.flash("error", "About record not found.");
      return res.redirect("/admin/view-about");
    }

    return res.render("app/add_about", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load about form.");
    return res.redirect("/admin/view-about");
  }
};

exports.renderAboutList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = await aboutService.getAboutList(req.query);
    return res.render("app/view_about", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load about list.");
    return res.redirect("/admin/");
  }
};

exports.saveAbout = async (req, res) => {
  try {
    await aboutService.saveAbout(req.body);
    req.flash("success", "About saved successfully.");
    return res.redirect("/admin/view-about");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save about.");
    return res.redirect(req.body?.id ? `/about?id=${req.body.id}` : "/about");
  }
};

exports.deleteAbout = async (req, res) => {
  try {
    const deleted = await aboutService.deleteAboutById(req.query.id);
    if (!deleted) {
      req.flash("error", "About record not found.");
      return res.redirect("/admin/view-about");
    }

    req.flash("success", "About deleted successfully.");
    return res.redirect("/admin/view-about");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete about.");
    return res.redirect("/admin/view-about");
  }
};

// Backward-compatible aliases
exports.about = exports.renderAboutForm;
exports.viewAbout = exports.renderAboutList;
exports.createAbout = exports.saveAbout;
