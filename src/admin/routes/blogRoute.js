const auth = require("../../middleware/adminauth");
const Upload = require("../../middleware/img");
const { Router } = require("express");
const app = Router();
const {
  renderBlogForm,
  saveBlog,
  renderBlogList,
  deleteBlog,
  viewBlogDescription,
} = require("../controller/blogController");

app.get("/add-blog", auth, renderBlogForm);
app.post("/add-blog-store", auth, Upload.single("image"), saveBlog);
app.get("/view-blog", auth, renderBlogList);
app.get("/delete-blog", auth, deleteBlog);
app.get("/view-blog-description", auth, viewBlogDescription);


module.exports = app;
