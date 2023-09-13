const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    timestamp: { type: Date },
    upvote: { type: Number, default: 0 },
  },
  opts,
);

// Virtual for formatted date/time comment creation
CommentSchema.virtual("formatted_date_stamp").get(function () {
  const formattedDate = DateTime.fromJSDate(this.timestamp, {
    zone: "utc",
  }).toLocaleString(DateTime.DATE_MED);

  return formattedDate;
});

module.exports = mongoose.model("Comment", CommentSchema);
