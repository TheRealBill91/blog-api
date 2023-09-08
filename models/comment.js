const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  timestamp: { type: Date, default: Date.now },
  upvote: { type: Number, default: 0 },
});

module.exports = mongoose.model("Post", PostSchema);
