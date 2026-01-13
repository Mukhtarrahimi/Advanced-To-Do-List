const express = require("express");
const router = express.Router();

// Controllers
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  refreshToken,
  changePassword,
  forgotPassword,
} = require("../controllers/authController");

// Middlewares
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.put("/update-profile", protect, updateProfile);
router.get("/me", protect, getMe);
router.post("/refresh-token", refreshToken);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", protect, forgotPassword);

module.exports = router;
