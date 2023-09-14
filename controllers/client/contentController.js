const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Post = require("../../models/post");
const Comment = require("../../models/comment");
const CommentUpvote = require("../../models/comment_upvote");
const { validationResult, body } = require("express-validator");

// Retrieve blog entries for client frontend
exports.blog_entries = async (req, res, next) => {
  const blogEntries = await Post.find()
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .exec();

  if (!blogEntries.length > 0) {
    return res.status(200).json([]);
  }

  return res.status(200).json(blogEntries);
};

exports.single_blog = async (req, res, next) => {
  const { postId } = req.params;
  const [blog, blogComments] = await Promise.all([
    Post.findById(postId)
      .populate({
        path: "author",
        select: "first_name last_name -_id ",
      })
      .exec(),
    Comment.find({ post: postId }).exec(),
  ]);

  console.log(blogComments);

  if (blog === null) {
    return res.status(404).json({ message: "Blog does not exist" });
  }

  if (!blogComments.length > 0) {
    return res.status(200).json([]);
  }

  let blogCommentUpvotes;
  try {
    blogCommentUpvotes = await Promise.all(
      blogComments.map(async (blogComment) => {
        const commentUpvotes = await CommentUpvote.find({
          comment: blogComment.id,
        }).countDocuments();
        return commentUpvotes;
      }),
    );
    console.log("blog comment upvotes" + blogCommentUpvotes);
  } catch (error) {
    res.status(400).json(error);
  }

  blogComments.map(async (blogComment) => {
    blogCommentUpvotes.forEach((commentUpvote) => {
      blogComment.commentUpvoteCount = commentUpvote;
    });
    return blogCommentUpvotes;
  });

  console.log(blogComments);
  return res.status(200).json(blogComments);
};

exports.comment_post = [
  body("content", "must include a comment")
    .trim()
    .isLength({ min: 2 })
    .withMessage("comment must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("comment too long, 50 characters or less")
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const comment = new Comment({
      content: req.body.content,
      author: req.user.id,
      post: req.params.id,
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({
        content: req.body.content,
        errors: errors.array(),
      });
    } else {
      try {
        await comment.save();
        return res.status(200).json({ message: "comment saved" });
      } catch (error) {
        return res.status(400).json(`Something went wrong ${error}`);
      }
    }
  },
];

exports.blog_comments = async (req, res, next) => {
  const allComments = await Comment.find({
    post: req.params.postId,
  })
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .exec();

  if (!allComments.length > 0) {
    return res.status(200).json([]);
  }

  return res.status(200).json(allComments);
};

exports.comment_upvote = async (req, res) => {
  const { commentId } = req.params;
  console.log("user id:" + req.user.id);

  try {
    const commentIdExists = await Comment.findById(commentId);

    if (commentIdExists === null) {
      return res.status(404).json("Comment id does not exist");
    }

    const upvotedComment = await CommentUpvote.find({
      user: req.user.id,
      comment: commentId,
    }).exec();

    console.log("upvote comment: " + upvotedComment);

    if (upvotedComment.length > 0) {
      await CommentUpvote.findOneAndDelete(upvotedComment.id);
      return res.status(200).json("Comment upvote removed");
    } else if (!upvotedComment.length > 0) {
      const commentUpvote = new CommentUpvote({
        user: req.user.id,
        comment: commentId,
      });
      await commentUpvote.save();
      return res.status(200).json("comment upvoted successfully");
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.comment_upvotes_count = async (req, res) => {};
