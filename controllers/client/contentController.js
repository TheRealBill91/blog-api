const Post = require("../../models/post");
const Comment = require("../../models/comment");
const CommentUpvote = require("../../models/comment_upvote");
const { validationResult, body } = require("express-validator");
const { DateTime } = require("luxon");

// Retrieve blog entries for client frontend
exports.blog_entries = async (req, res, next) => {
  const blogEntries = await Post.find({ published: true }, "-published")
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .sort({ timestamp: -1 })
    .exec();

  if (!blogEntries.length > 0) {
    return res.status(200).json([]);
  }

  return res.status(200).json(blogEntries);
};

exports.single_blog = async (req, res, next) => {
  const { postId } = req.params;

  const blog = await Post.findById(postId)
    .populate({
      path: "author",
      select: "first_name last_name -_id ",
    })
    .exec();

  if (blog === null) {
    return res.status(404).json({ message: "Blog does not exist" });
  }

  return res.status(200).json({ blog });
};

exports.comment_post = [
  body("content", "must include a comment")
    .trim()
    .isLength({ min: 2 })
    .withMessage("comment must be at least 2 characters")
    .isLength({ max: 500 })
    .withMessage("comment too long, 500 characters or less"),

  async (req, res, next) => {
    const errors = validationResult(req);
    const comment = new Comment({
      content: req.body.content,
      author: req.user.id,
      timestamp: DateTime.now().toISO(),
      post: req.params.postId,
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      try {
        await comment.save();
        return res.status(201).json({ message: "comment saved" });
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
      select: "username local.username google.firstName google.lastName -_id ",
    })
    .sort({ timestamp: -1 })
    .exec();

  if (!allComments.length > 0) {
    return res.status(200).json([]);
  }

  const commentIds = allComments.map((comment) => comment.id);
  const userId = req.user ? req.user.id : null;
  const commentUpvotes = await CommentUpvote.find({
    user: userId,
    comment: { $in: commentIds },
  });

  // id of each comment upvoted by the user
  const upvotedCommentIds = new Set();
  commentUpvotes.map((commentUpvote) => {
    return upvotedCommentIds.add(commentUpvote.comment.toString());
  });

  const updatedComments = allComments.map((comment) => {
    const commentUpvoted = upvotedCommentIds.has(comment.id);
    return { ...comment._doc, liked: commentUpvoted };
  });

  return res.status(200).json(updatedComments);
};

exports.comment_upvote = async (req, res) => {
  const { commentId } = req.params;

  try {
    const commentIdExists = await Comment.findById(commentId);

    if (commentIdExists === null) {
      return res.status(404).json("Comment id does not exist");
    }

    const upvotedComment = await CommentUpvote.findOne({
      user: req.user.id,
      comment: commentId,
    }).exec();

    if (upvotedComment) {
      await CommentUpvote.findOneAndDelete({
        user: req.user.id,
        comment: commentId,
      });

      // update comment upvote count
      const commentUpvotes = await CommentUpvote.find({ comment: commentId })
        .countDocuments()
        .exec();
      const comment = await Comment.findById(commentId);
      comment.upvote = commentUpvotes;
      await comment.save();

      return res.status(201).json("Comment upvote removed");
    } else if (!upvotedComment) {
      const commentUpvote = new CommentUpvote({
        user: req.user.id,
        comment: commentId,
        timestamp: Date.now(),
      });
      await commentUpvote.save();

      // update comment upvote count
      const commentUpvotes = await CommentUpvote.find({ comment: commentId })
        .countDocuments()
        .exec();
      const comment = await Comment.findById(commentId);
      comment.upvote = commentUpvotes;
      await comment.save();

      return res.status(201).json("comment upvoted successfully");
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};
