const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const CommentUpvote = require("../../models/comment_upvote");

require("dotenv").config();
const { body, validationResult } = require("express-validator");
const expressAsyncHandler = require("express-async-handler");
const { DateTime } = require("luxon");

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

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      timestamp: DateTime.now().toISO(),
      published: req.body.publishStatus !== undefined ? true : false,
    });

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
  const { postId } = req.params;
  const [blog, blogComments] = await Promise.all([
    await Post.findById(postId).exec(),
    await Comment.find({ post: postId }).populate("author").exec(),
  ]);

  const commentUpvotePromises = blogComments.map(async (blogComment) => {
    const commentUpvotes = await CommentUpvote.find({
      comment: blogComment.id,
    }).countDocuments();
    return commentUpvotes;
  });

  const commentUpvotes = await Promise.all(commentUpvotePromises);
  console.log(commentUpvotes);

  if (!blog) {
    const err = new Error(404);
    return next(404);
  }

  res.render("edit_blog_form", {
    pageTitle: "Edit Blog",
    title: "Edit Blog",
    blogTitle: blog.title,
    blog: blog,
    blogComments: blogComments,
    commentUpvotes: commentUpvotes,
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

    if (!errors.isEmpty()) {
      res.render("edit_blog_form", {
        pageTitle: "Edit Blog",
        title: "Edit Blog",
        blogTitle: post.title,
        blog: post,
        errors: errors.array(),
        blogComments: blogComments,
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

exports.comment_delete_get = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const blogComment = await Comment.findById(commentId)
    .populate("author")
    .exec();

  if (!blogComment) {
    const err = new Error(404);
    return next(err);
  }

  res.render("comment_delete_form", {
    pageTitle: "Delete comment",
    title: "Delete comment",
    comment: blogComment,
  });
});

exports.comment_delete_post = expressAsyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const commentUpvotes = await CommentUpvote.deleteMany({
    comment: commentId,
  });

  await Comment.findByIdAndDelete(commentId);
  res.redirect("/");
});
