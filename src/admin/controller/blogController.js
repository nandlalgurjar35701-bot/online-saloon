const blogService = require("../service/blogService");

exports.renderBlogForm = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.user?.tendentId) {
      req.query.tendentId = req.user.tendentId;
    }
    const categoryData = await blogService.getBlogCategoryOptions(req.query);
    const blogData = req.query.id ? await blogService.getBlogById(req.query.id) : null;

    if (req.query.id && !blogData) {
      req.flash("error", "Blog not found.");
      return res.redirect("/admin/view-blog");
    }

    return res.render("blog/add_blog", {
      user: req.user,
      category_data: categoryData,
      _id: req.query.id,
      blog_data: blogData,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load blog form.");
    return res.redirect("/admin/view-blog");
  }
};

exports.saveBlog = async (req, res) => {
  try {
    if (req.user?.tendentId) {
      req.body.tendentId = req.user.tendentId;
    }
    await blogService.saveBlog(req);
    req.flash("success", "Blog saved successfully.");
    return res.redirect("/admin/view-blog");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Unable to save blog.");
    return res.redirect(req.query?.id ? `/add-blog?id=${req.query.id}` : "/add-blog");
  }
};

exports.renderBlogList = async (req, res) => {
  try {
    res.locals.message = req.flash();
    if (req.user?.tendentId) {
      req.query.tendentId = req.user.tendentId;
    }
    const data = await blogService.getBlogList(req.query);
    const category = await blogService.getBlogCategoryOptions(req.query);
    const writerName = await blogService.getBlogWriterOptions(req.query);

    return res.render("blog/view_blog", {
      data,
      user: req.user,
      Category: category,
      query: req.query,
      WriterName: writerName,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to load blogs.");
    return res.redirect("/admin/");
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await blogService.deleteBlogById(req.query.id);
    if (!deleted) {
      req.flash("error", "Blog not found.");
      return res.redirect("/admin/view-blog");
    }
    req.flash("success", "Blog deleted successfully.");
    return res.redirect("/admin/view-blog");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unable to delete blog.");
    return res.redirect("/admin/view-blog");
  }
};

exports.viewBlogDescription = async (req, res) => {
  try {
    const data = await blogService.getBlogDescriptionById(req.query.id);
    return res.send(data ? [data] : []);
  } catch (error) {
    console.log(error);
    return res.send([]);
  }
};
