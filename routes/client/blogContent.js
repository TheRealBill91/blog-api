const express = require("express");
const blogContentRouter = express.Router();

const blogContentController = require("../../controllers/client/contentController");
const authorization = require("../../middleware/authorization");

// copy this into client blogContent route
blogContentRouter.get(
  "/blog_entries",
  authorization.userAuthorization,
  blogContentController.blog_entries,
);

blogContentRouter.get(
  "/:postId",
  authorization.userAuthorization,
  blogContentController.single_blog,
);

blogContentRouter.post(
  "/:postId/comment_creation",
  authorization.userAuthorization,
  blogContentController.comment_post,
);

blogContentRouter.get(
  "/:postId/blog_comments",
  authorization.userAuthorization,
  blogContentController.blog_comments,
);

module.exports = blogContentRouter;
