const express = require("express");
const indexRouter = express.Router();

const authorization = require("../../middleware/auth/authorization");
const blogContentController = require("../../controllers/admin/contentController");
const RateLimit = require("express-rate-limit");

const homePageGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

/* GET home page. */
indexRouter.get(
  "/",
  homePageGetLimiter,
  authorization.adminAuthorization,
  blogContentController.blog_entries,
);

module.exports = indexRouter;
