const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  resetToken,
  getCurrentUser,
  updateUser,
  uploadProfilePhoto,
  changePassword,
  // appleSignin,
} = require("../controllers/auth");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.post("/resettoken", resetToken);
router.get("/me", protect, getCurrentUser);
router.put("/uploadphoto/:id", protect, uploadProfilePhoto);
router.put("/updateuser", protect, updateUser);
router.put("/changepassword", protect, changePassword);

module.exports = router;
