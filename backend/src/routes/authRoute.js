const express = require("express");
const router = express.Router();
// imorted
const
    protect = require("../middlewares/authMiddleware");
const { register, login, logout } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);

module.exports = router;
