const teamService = require("../service/teamService");

exports.renderTeamForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = req.query.id
      ? await teamService.getTeamMemberById(req.query.id)
      : null;

    if (req.query.id && !data) {
      req.flash("error", "Team member not found.");
      return res.redirect("/admin/view-team-member");
    }

    return res.render("app/add_team", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to open team form.");
    return res.redirect("/admin/view-team-member");
  }
};

exports.renderTeamList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    const data = await teamService.getTeamMembers(req.query);
    return res.render("app/view_team", {
      user: req.user,
      data,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load team list.");
    return res.redirect("/admin/");
  }
};

exports.saveTeamMember = async (req, res) => {
  try {
    await teamService.saveTeamMember({ body: req.body, file: req.file });
    req.flash("success", "Team member saved successfully.");
    return res.redirect("/admin/view-team-member");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save team member.");
    return res.redirect(req.body?.id ? `/team-member?id=${req.body.id}` : "/team-member");
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const deleted = await teamService.deleteTeamMemberById(req.query.id);
    if (!deleted) {
      req.flash("error", "Team member not found.");
      return res.redirect("/admin/view-team-member");
    }

    req.flash("success", "Team member deleted successfully.");
    return res.redirect("/admin/view-team-member");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete team member.");
    return res.redirect("/admin/view-team-member");
  }
};

