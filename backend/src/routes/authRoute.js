const express = require("express");
const router = express.Router();
// imorted
const protect = require("../middlewares/authMiddleware");
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
