const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
});

module.exports = mongoose.model("Post", PostSchema);
