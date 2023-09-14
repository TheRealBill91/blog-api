const express = require("express");
const blogContentRouter = express.Router();

const authorization = require("../../middleware/auth/authorization");

const contentController = require("../../controllers/admin/contentController");

blogContentRouter.get(
  "/blog_list",
  authorization.adminAuthorization,
  contentController.blog_entries,
);

blogContentRouter.get("/blogcreation", contentController.create_blog_get);

blogContentRouter.post("/blogsubmission", contentController.create_blog_post);

// Static routes are placed before dynamic routes
// to ensure correct route matching

blogContentRouter.post("/post/:id/revision", contentController.blog_edit_post);

blogContentRouter.get("/post/:id/revision", contentController.blog_edit_get);

module.exports = blogContentRouter;
