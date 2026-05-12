const siteSettingService = require("../service/siteSettingService");

exports.renderSiteSettingForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = req.query.id ? await siteSettingService.getSiteSettingById(req.query.id) : null;

    if (req.query.id && !data) {
      req.flash("error", "Site setting record not found.");
      return res.redirect("/admin/view-site-setting-config");
    }

    return res.render("app/add_site_setting", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to open site setting form.");
    return res.redirect("/admin/view-site-setting-config");
  }
};

exports.renderSiteSettingList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.user?.tendentId) {
      req.query.tendentId = req.user.tendentId;
    }
    const data = await siteSettingService.getSiteSettingList(req.query);

    return res.render("app/view_site_setting", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load site setting list.");
    return res.redirect("/admin/");
  }
};

exports.saveSiteSetting = async (req, res) => {
  try {
    if (req.user?.tendentId) {
      req.body.tendentId = req.user.tendentId;
    }
    await siteSettingService.saveSiteSetting(req.body);
    req.flash("success", "Site setting saved successfully.");
    return res.redirect("/admin/view-site-setting-config");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save site setting.");
    return res.redirect(req.body?.id ? `/site-setting-config?id=${req.body.id}` : "/site-setting-config");
  }
};

exports.deleteSiteSetting = async (req, res) => {
  try {
    const deleted = await siteSettingService.deleteSiteSettingById(req.query.id);
    if (!deleted) {
      req.flash("error", "Site setting record not found.");
      return res.redirect("/admin/view-site-setting-config");
    }

    req.flash("success", "Site setting deleted successfully.");
    return res.redirect("/admin/view-site-setting-config");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete site setting.");
    return res.redirect("/admin/view-site-setting-config");
  }
};
