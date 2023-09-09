const express = require("express");
const router = express.Router();

const blogContentController = require("../controllers/contentController");

/* GET home page. */
router.get("/", blogContentController.blog_entries);

module.exports = router;
