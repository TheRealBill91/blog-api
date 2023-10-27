const express = require("express");
const blogContentRouter = express.Router();

const authorization = require("../../middleware/auth/authorization");

const contentController = require("../../controllers/admin/contentController");
const RateLimit = require("express-rate-limit");

const blogListGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.get(
  "/blog_list",
  blogListGetLimiter,
  authorization.adminAuthorization,
  contentController.blog_entries,
);

const blogCreationGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.get(
  "/blog_submission",
  blogCreationGetLimiter,
  authorization.adminAuthorization,
  contentController.create_blog_get,
);

const blogSubmissionPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.post(
  "/blog_submission",
  blogSubmissionPostLimiter,
  authorization.adminAuthorization,
  contentController.create_blog_post,
);

// Static routes are placed before dynamic routes
// to ensure correct route matching

const blogPostRevisionPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.post(
  "/post/:postId/revision",
  blogPostRevisionPostLimiter,
  authorization.adminAuthorization,
  contentController.blog_edit_post,
);

const blogPostRevisionGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.get(
  "/post/:postId/revision",
  blogPostRevisionGetLimiter,
  authorization.adminAuthorization,
  contentController.blog_edit_get,
);

const commentDeletionGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.get(
  "/comment/:commentId/deletion",
  commentDeletionGetLimiter,
  authorization.adminAuthorization,
  contentController.comment_delete_get,
);

const commentDeletionPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

blogContentRouter.post(
  "/comment/:commentId/deletion",
  commentDeletionPostLimiter,
  authorization.adminAuthorization,
  contentController.comment_delete_post,
);

module.exports = blogContentRouter;
