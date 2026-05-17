const galleryService = require("../service/galleryService");

exports.renderGalleryForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = req.query.id ? await galleryService.getGalleryById(req.query.id) : null;

    if (req.query.id && !data) {
      req.flash("error", "Gallery record not found.");
      return res.redirect("/admin/view-gallery-config");
    }

    return res.render("app/add_gallery", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to open gallery form.");
    return res.redirect("/admin/view-gallery-config");
  }
};

exports.renderGalleryList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.headers['tendentId']) {
      req.query.tendentId = req.headers['tendentId'];
    }
    const data = await galleryService.getGalleryList(req.query);

    return res.render("app/view_gallery", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load gallery list.");
    return res.redirect("/admin/");
  }
};

exports.saveGallery = async (req, res) => {
  try {
    if (req.headers['tendentId']) {
      req.body.tendentId = req.headers['tendentId'];
    }
    await galleryService.saveGallery({ body: req.body, file: req.file });
    req.flash("success", "Gallery saved successfully.");
    return res.redirect("/admin/view-gallery-config");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save gallery.");
    return res.redirect(req.body?.id ? `/gallery-config?id=${req.body.id}` : "/gallery-config");
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const deleted = await galleryService.deleteGalleryById(req.query.id);
    if (!deleted) {
      req.flash("error", "Gallery record not found.");
      return res.redirect("/admin/view-gallery-config");
    }

    req.flash("success", "Gallery deleted successfully.");
    return res.redirect("/admin/view-gallery-config");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete gallery.");
    return res.redirect("/admin/view-gallery-config");
  }
};
