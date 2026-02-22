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
} = require("./controllers");

app.get("/add-blog", auth, renderBlogForm);
app.post("/add-blog-store", auth, Upload.single("image"), saveBlog);
app.get("/view-blog", auth, renderBlogList);
app.get("/delete-blog", auth, deleteBlog);
app.get("/view-blog-description", auth, viewBlogDescription);

// Backward-compatible routes
app.get("/add_blog", auth, renderBlogForm);
app.post("/add_blog_store", auth, Upload.single("image"), saveBlog);
app.get("/view_blog", auth, renderBlogList);
app.get("/delete_blog", auth, deleteBlog);
app.get("/Viwes-Find-Blog", auth, viewBlogDescription);

module.exports = app;
