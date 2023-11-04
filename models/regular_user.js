const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const RegularUserSchema = new Schema(
  {
    method: {
      type: String,
      enum: ["local", "google"],
      required: true,
    },
    local: {
      username: { type: String, maxLength: 14 },
      email: { type: String },
      password: { type: String },
    },
    google: {
      id: { type: String },
      email: {
        type: String,
        unique: [true, "email already registered"],
      },
      firstName: String,
      lastName: String,
      password: String,

      lastVisited: {
        type: Date,
        default: new Date(),
      },
    },
  },
  opts,
);

// Virtual for google user first name and last initial
RegularUserSchema.virtual("first_last_initial").get(function () {
  const lastNameInitial = this.google.lastName
    ? this.google.lastName.slice(0, 1)
    : undefined;
  const username = this.google.firstName
    ? this.google.firstName + " " + lastNameInitial
    : undefined;
  return username;
});

module.exports = mongoose.model("RegularUser", RegularUserSchema);
