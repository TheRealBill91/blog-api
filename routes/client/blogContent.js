const express = require("express");
const blogContentRouter = express.Router();

const blogContentController = require("../../controllers/client/contentController");
const authorization = require("../../middleware/auth/authorization");
const RateLimit = require("express-rate-limit");

const blogEntriesGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 120, // Limit each IP to 120 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.get(
  "/blog_entries",
  blogEntriesGetLimiter,
  blogContentController.blog_entries,
);

const blogPostGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 120, // Limit each IP to 120 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.get(
  "/:postId",
  blogPostGetLimiter,
  blogContentController.single_blog,
);

const blogCommentPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 12, // Limit each IP to 12 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.post(
  "/:postId/comment_creation",
  blogCommentPostLimiter,
  authorization.userAuthorization,
  blogContentController.comment_post,
);

blogContentRouter.get(
  "/:postId/blog_comments",
  blogPostGetLimiter,
  blogContentController.blog_comments,
);

const blogCommentUpvoteLimiter = RateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.post(
  "/:commentId/comment_upvote",
  blogCommentUpvoteLimiter,
  authorization.userAuthorization,
  blogContentController.comment_upvote,
);

module.exports = blogContentRouter;
