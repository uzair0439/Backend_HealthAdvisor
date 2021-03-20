const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, "Please add a label"],
  },
  calories: {
    type: Number,
    required: [true, "Please add an calorie"],
  },
  required: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Food", userSchema);
