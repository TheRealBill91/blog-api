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

// blogContentRouter.get("/blog_list");

module.exports = blogContentRouter;
