const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const { validationResult, body } = require("express-validator");

// Retrieve blog entries for client frontend
exports.blog_entries = asyncHandler(async (req, res, next) => {
  const blogEntries = await Post.find()
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .exec();

  if (!blogEntries.length > 0) {
    return res.status(404).json({ message: "No blogs found" });
  }

  return res.status(200).json(blogEntries);
});

exports.single_blog = asyncHandler(async (req, res, next) => {
  const blog = await Post.findById(req.params.id)
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .exec();

  console.log(blog);

  if (blog === null || undefined) {
    return res.status(404).json({ message: "Blog does not exist" });
  }

  return res.status(200).json(blog);
});

exports.comment_post = [
  body("content", "must include a comment")
    .trim()
    .isLength({ min: 2 })
    .withMessage("comment must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("comment too long, 50 characters or less")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const comment = new Comment({
      content: req.body.content,
      author: req.user.id,
      post: req.params.id,
    });

    if (!errors.isEmpty()) {
      return res.status(401).json({
        content: req.body.content,
        errors: errors.array(),
      });
    } else {
      await comment.save();
      return res.status(200).json({ message: "comment saved" });
    }
  }),
];

exports.blog_comments = asyncHandler(async (req, res, next) => {
  const allComments = await Comment.find({
    post: req.params.postId,
  })
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .exec();

  if (!allComments.length > 0) {
    return res.status(404).json({ message: "No comments found" });
  }

  return res.status(200).json(allComments);
});
