const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Post = require("../../models/post");

// Retrieve blog entries for client frontend
exports.blog_entries = asyncHandler(async (req, res, next) => {
  const blogEntries = await Post.find().populate("author").exec();

  if (!blogEntries.length > 0) {
    return res.status(404).json({ message: "No blogs found" });
  }

  return res.status(200).json(blogEntries);
});
