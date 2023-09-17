const express = require("express");
const blogContentRouter = express.Router();

const blogContentController = require("../../controllers/client/contentController");
const authorization = require("../../middleware/auth/authorization");

// copy this into client blogContent route
blogContentRouter.get("/blog_entries", blogContentController.blog_entries);

blogContentRouter.get("/:postId", blogContentController.single_blog);

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

blogContentRouter.post(
  "/:commentId/comment_upvote",
  authorization.userAuthorization,
  blogContentController.comment_upvote,
);

module.exports = blogContentRouter;
