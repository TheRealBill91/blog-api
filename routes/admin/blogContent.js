const express = require("express");
const blogContentRouter = express.Router();

const authorization = require("../../middleware/auth/authorization");

const contentController = require("../../controllers/admin/contentController");

blogContentRouter.get(
  "/blog_list",
  authorization.adminAuthorization,
  contentController.blog_entries,
);

blogContentRouter.get(
  "/blogcreation",
  authorization.adminAuthorization,
  contentController.create_blog_get,
);

blogContentRouter.post(
  "/blogsubmission",
  authorization.adminAuthorization,
  contentController.create_blog_post,
);

// Static routes are placed before dynamic routes
// to ensure correct route matching

blogContentRouter.post(
  "/post/:postId/revision",
  authorization.adminAuthorization,
  contentController.blog_edit_post,
);

blogContentRouter.get(
  "/post/:postId/revision",
  authorization.adminAuthorization,
  contentController.blog_edit_get,
);

blogContentRouter.get(
  "/comment/:commentId/deletion",
  authorization.adminAuthorization,
  contentController.comment_delete_get,
);

blogContentRouter.post(
  "/comment/:commentId/deletion",
  authorization.adminAuthorization,
  contentController.comment_delete_post,
);

module.exports = blogContentRouter;
