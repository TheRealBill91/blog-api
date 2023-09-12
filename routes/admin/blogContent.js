const express = require("express");
const blogContentRouter = express.Router();

const authorization = require("../../middleware/authorization");

const contentController = require("../../controllers/admin/contentController");

blogContentRouter.post("/post/:id/edit", contentController.blog_edit_post);

blogContentRouter.get("/post/:id/edit", contentController.blog_edit_get);



blogContentRouter.get(
  "/blog_list",
  authorization.adminAuthorization,
  contentController.blog_entries,
);

blogContentRouter.get("/blogentry", contentController.create_blog_get);

blogContentRouter.post("/blogEntry", contentController.create_blog_post);

module.exports = blogContentRouter;
