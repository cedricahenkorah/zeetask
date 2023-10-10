const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSChema = new Schema({
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("User", userSChema);
