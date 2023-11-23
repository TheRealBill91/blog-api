const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const CommentUpvoteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    timestamp: { type: Date },
  },
  opts,
);

module.exports = mongoose.model("CommentUpvote", CommentUpvoteSchema);
