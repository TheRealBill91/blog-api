const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 20 },
  last_name: { type: String, required: true, maxLength: 20 },
  email: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean },
});

// Virtual for first and last name
UserSchema.virtual("full_name").get(function () {
  let fullName = "";
  fullName = `${this.first_name}, ${this.last_name}`;
  return fullName;
});

module.exports = mongoose.model("User", UserSchema);
