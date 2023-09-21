const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RegularUserSchema = new Schema({
  username: { type: String, required: true, maxLength: 14 },
  email: { type: String, required: true },
  password: { type: String, required: true },
  confirm_password: { type: String, required: true },
});

module.exports = mongoose.model("RegularUser", RegularUserSchema);
