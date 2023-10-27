const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const googleUserSchema = new Schema({
  id: { type: String },
  email: {
    type: String,
    required: [true, "email required"],
    unique: [true, "email already registered"],
  },
  firstName: String,
  lastName: String,
  password: String,
  source: {
    type: String,
    required: [true, "source not specified"],
  },
  lastVisited: {
    type: Date,
    default: new Date(),
  },
});

const googleUserModel = mongoose.model("googleUser", googleUserSchema);

module.exports = googleUserModel;
