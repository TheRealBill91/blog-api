const express = require("express");
const router = express.Router();

const authorization = require("../middleware/authorization");
const blogContentController = require("../controllers/contentController");

/* GET home page. */
router.get(
  "/",
  authorization.adminAuthorization,
  blogContentController.blog_entries,
);

module.exports = router;
