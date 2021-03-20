const User = require("../modals/Users");
const ErrorResponse = require("../utills/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utills/sendEmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const { networkInterfaces } = require("os");

//@Desc     register
//Method    POST
//@routes   /api/v1/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, dateOfBirth, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(
      new ErrorResponse(`A user with email ${email} already exists`, 400)
    );
  }
  const userDB = await User.create({ name, email, password, dateOfBirth });
  sendTokenResponse(userDB, 200, res);
});
//@Desc     Login
//Method    POST
//@routes   /api/v1/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide an email and a password", 401)
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Email", 401));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Password", 401));
  }
  sendTokenResponse(user, 200, res);
});
//@Desc     Forgot Password
//Method    POST
//@routes   /api/v1/forgotpassword
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse("Email not registered", 401));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const message = `<h3>Hi ${user.name}</h3><p>You recently requested the reset of a password. this is your password reset code: \n\n<h2>${resetToken}</h2></p>`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset Code",
      message,
      html: message,
    });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    next(new ErrorResponse("Email could not be sent", 500));
  }
  res.status(200).json({ success: true, data: { user } });
});
//@Desc     Compare resetToken
//Method    POST
//@routes   /api/v1/resettoken
//access    Public
exports.resetToken = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.body;
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorResponse("Reset Token did not match or time out"),
      400
    );
  }
  res.status(200).json({ success: true });
});
//@Desc     Reset Password
//Method    POST
//@routes   /api/v1/resetpassword
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, password } = req.body;
  console.log(resetToken, password);
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorResponse(
        "Verification link has been expired, try reset the password again",
        400
      )
    );
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password has been changed successfully" });
});
//@Desc     get User
//Method    Get
//@routes   /api/v1/resetpassword
//@access   private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});
//@Desc     upload user photo
//Method    put
//@routes   /api/v1//uploadphoto/:id
//@access   private
exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  console.log(user);
  //code to get IP address
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  if (!user) {
    return next(
      new ErrorResponse(`User not found with ID ${req.params.id}`, 404)
    );
  }
  if (user.id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this Profile`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const file = req.files.file;
  //make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD / 1000000
        } Mb`,
        400
      )
    );
  }
  //create custom file name
  file.name = `Photo_${user.id}${path.parse(file.name).ext}`;
  console.log(path.parse(file.name));
  let filePath = process.env.FILE_UPLOAD_PATH.substring(8);
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return new ErrorResponse(`Problem with file upload`, 500);
    }
    await User.findByIdAndUpdate(req.params.id, {
      photo: `${req.protocol}://${req.get("host")}${filePath}/${file.name}`,
    });
    res.status(200).json({
      success: true,
      data: file.name,
      message: "User profile updated",
    });
  });
});
//@Desc     update user
//Method    put
//@routes   /api/v1/updateuser
//@access   private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: false,
  });
  res.status(200).json({
    success: true,
    message: "User profile updated",
    data: user,
  });
});
exports.changePassword = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  console.log(id);
  const { password } = req.body;
  console.log(password);
  const user = await User.findOne({
    _id: id,
  });
  if (!user) {
    return next(new ErrorResponse("An Error Occured", 400));
  }
  user.password = password;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password has been changed successfully" });
});
//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRE * 20 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).json({ success: true, token });
};
