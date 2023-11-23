const asyncHandler = require("express-async-handler");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const CommentUpvote = require("../../models/comment_upvote");
require("dotenv").config();

require("dotenv").config();
const { body, validationResult } = require("express-validator");
const expressAsyncHandler = require("express-async-handler");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

// Retrieve blog entries for admin backend
exports.blog_entries = asyncHandler(async (req, res, next) => {
  const blogEntries = await Post.find({}, "-content")
    .populate("author")
    .sort({ published: -1 })
    .exec();

  // if (!blogEntries.length > 0) {
  //   const err = new Error(404);
  //   return next(err);
  // }

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
      published: req.body.publishStatus !== undefined,
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
      await post.save();
      res.redirect("/");
    }
  }),
];

exports.blog_edit_get = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const tinyMCEAPIKey = process.env.TINYMCE;
  const [blog, blogComments] = await Promise.all([
    await Post.findById(postId).exec(),
    await Comment.find({ post: postId })
      .populate("author")
      .sort({ timestamp: -1 })
      .exec(),
  ]);

  const blogCommentIds = blogComments.map((blogComment) => blogComment.id);

  const allCommentUpvotes = await CommentUpvote.find({
    comment: { $in: blogCommentIds },
  });

  const commentUpvotes = blogComments.map((blogComment) => {
    const commentUpvotesFiltered = allCommentUpvotes.filter(
      (commentUpvote) => commentUpvote.id === blogComment.id,
    );

    const commentUpvoteCount = commentUpvotesFiltered.length;
    return commentUpvoteCount;
  });

  if (!blog) {
    const err = new Error(404);
    return next(err);
  }

  res.render("edit_blog_form", {
    pageTitle: "Edit Blog",
    title: "Edit Blog",
    blogTitle: blog.title,
    blog,
    blogComments,
    commentUpvotes,
    tinyMCEAPIKey,
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

    const blogComments = await Comment.find({ post: req.params.postId })
      .populate("author")
      .exec();

    const blogCommentIds = blogComments.map((blogComment) => blogComment.id);

    const allCommentUpvotes = await CommentUpvote.find({
      comment: { $in: blogCommentIds },
    });

    const commentUpvotes = blogComments.map((blogComment) => {
      const commentUpvotesFiltered = allCommentUpvotes.filter(
        (commentUpvote) => commentUpvote.id === blogComment.id,
      );

      const commentUpvoteCount = commentUpvotesFiltered.length;
      return commentUpvoteCount;
    });

    const postDate = await Post.findById(req.params.postId, "timestamp");

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
      timestamp: postDate.timestamp,
      published: req.body.publishStatus !== "",
      id: req.params.postId,
    });

    if (!errors.isEmpty()) {
      res.render("edit_blog_form", {
        pageTitle: "Edit Blog",
        title: "Edit Blog",
        blogTitle: post.title,
        blog: post,
        errors: errors.array(),
        blogComments,
        commentUpvotes,
      });
    } else {
      await Post.findByIdAndUpdate(req.params.postId, post, {}).exec();
      res.redirect("/");
    }
  }),
];

exports.blogPost_delete_get = asyncHandler(async (req, res, next) => {
  res.render("delete_page", {
    pageTitle: "Delete Post",
  });
});

exports.blogPost_delete_post = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const blogComments = await Comment.find({ post: postId });
      const blogCommentIds = blogComments.map((comment) => {
        return comment.id;
      });

      await CommentUpvote.deleteMany({
        comment: { $in: blogCommentIds },
      }).session(session);
      await Comment.deleteMany({ post: postId }).session(session);
      await Post.findByIdAndDelete(postId).session(session);
    });
  } finally {
    await session.endSession();
  }

  res.redirect("/");
});

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
  await CommentUpvote.deleteMany({
    comment: commentId,
  });

  // Use the comment id to get the associated post for redirect after comment deletion
  const comment = await Comment.findById(commentId).exec();
  const postId = comment.post;

  await Comment.findByIdAndDelete(commentId);
  res.redirect(`/post/${postId}/revision`);
});
