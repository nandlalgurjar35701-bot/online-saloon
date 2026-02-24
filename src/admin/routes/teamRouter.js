const auth = require("../../middleware/adminauth");
const Upload = require("../../middleware/img");
const { Router } = require("express");
const app = Router();
const controller = require("../controller/teamController");

app.get("/team-member", auth, controller.renderTeamForm);
app.get("/view-team-member", auth, controller.renderTeamList);
app.post("/team-member-save", auth, Upload.single("image"), controller.saveTeamMember);
app.get("/delete-team-member", auth, controller.deleteTeamMember);

module.exports = app;

