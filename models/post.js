const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
    published: { type: Boolean, default: false },
  },
  opts,
);

// Virtual for formatted date/time post creation
PostSchema.virtual("formatted_date_stamp").get(function () {
  const formattedDate = DateTime.fromJSDate(this.timestamp, {
    zone: "utc",
  }).toLocaleString(DateTime.DATE_MED);

  return formattedDate;
});

// Virtual for post URL
PostSchema.virtual("url").get(function () {
  return `/post/${this._id}`;
});

module.exports = mongoose.model("Post", PostSchema);
