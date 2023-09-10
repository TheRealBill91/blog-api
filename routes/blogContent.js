const express = require("express");
const router = express.Router();

const authorization = require("../middleware/authorization");

const contentController = require("../controllers/contentController");

router.post("/post/:id/edit", contentController.blog_edit_post);

router.get("/post/:id/edit", contentController.blog_edit_get);

router.get("/client/bloglist", contentController.client_blog_entries)

router.get(
  "/blog_list",
  authorization.adminAuthorization,
  contentController.blog_entries,
);

router.get("/blogentry", contentController.create_blog_get);

router.post("/blogEntry", contentController.create_blog_post);

module.exports = router;
