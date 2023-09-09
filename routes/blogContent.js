const express = require("express");
const router = express.Router();

const contentController = require("../controllers/contentController");

router.post("/post/:id/edit", contentController.blog_edit_post);

router.get("/post/:id/edit", contentController.blog_edit_get);

router.get("/blog_list", contentController.blog_entries);

router.get("/blogentry", contentController.create_blog_get);

router.post("/blogEntry", contentController.create_blog_post);

module.exports = router;
