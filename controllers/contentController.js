const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Post = require("../models/post");

require("dotenv").config();
const { body, validationResult } = require("express-validator");
const expressAsyncHandler = require("express-async-handler");

// Retrieve blog entries for admin backend
exports.blog_entries = asyncHandler(async (req, res, next) => {
  const blogEntries = await Post.find().populate("author").exec();

  if (!blogEntries.length > 0) {
    const err = new Error(404);
    return next(err);
  }

  res.render("index", {
    pageTitle: "Blog Manager",
    title: "Blog Manager",
    blogs: blogEntries,
  });
});

exports.create_blog_get = (req, res, next) => {
  res.render("create_blog_form", {
    pageTitle: "Create Blog",
  });
};

exports.create_blog_post = [
  body("title", "Title is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title must be at least one letter."),
  body("content", "Content is required")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Content must be at least one sentence."),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    console.log(req.body.publishStatus)

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      published: req.body.publishStatus !== undefined ? true : false,
    });

    console.log(post)

    if (!errors.isEmpty()) {
      res.render("create_blog_form", {
        pageTitle: "Create Blog Entry",
        title: post.title,
        content: post.content,
        blog: post,
        errors: errors.array(),
      });
    } else {
      const newBlogEntry = await post.save();
      res.redirect("/");
    }
  }),
];

exports.blog_edit_get = asyncHandler(async (req, res, next) => {
  const blog = await Post.findById(req.params.id).exec();
  console.log(blog);

  if (!blog) {
    const err = new Error(404);
    return next(404);
  }

  res.render("edit_blog_form", {
    pageTitle: "Edit Blog",
    title: "Edit Blog",
    blogTitle: blog.title,
    blog: blog,
  });
});

exports.blog_edit_post = [
  body("title", "Title is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title must be at least one letter."),
  body("content", "Content is required")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Content must be at least one sentence."),
  body("publishStatus").trim(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      published: req.body.publishStatus !== "" ? true : false,
      id: req.params.id,
    });

    console.log(post);

    if (!errors.isEmpty()) {
      res.render("edit_blog_form", {
        pageTitle: "Edit Blog",
        title: "Edit Blog",
        blogTitle: post.title,
        blog: post,
        errors: errors.array(),
      });
    } else {
      const updatedBlog = await Post.findByIdAndUpdate(
        req.params.id,
        post,
        {},
      ).exec();
      res.redirect("/");
    }
  }),
];
