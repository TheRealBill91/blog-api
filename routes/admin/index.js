const express = require("express");
const indexRouter = express.Router();

const authorization = require("../../middleware/auth/authorization");
const blogContentController = require("../../controllers/admin/contentController");

/* GET home page. */
indexRouter.get(
  "/",
  authorization.adminAuthorization,
  blogContentController.blog_entries,
);

module.exports = indexRouter;
