const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/,
      "please use a valid email",
    ],
  },
  photo: {
    type: String,
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: new Date().getTime(),
    // required: [true, "please add a birth date"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: new Date().getTime(),
  },
});

//encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
//sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
//Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  //generate token
  const resetToken = Math.floor(100000 + Math.random() * 900000);
  //hash token and set to reset password token field
  this.resetPasswordToken = resetToken;
  //set the expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model("User", userSchema);
