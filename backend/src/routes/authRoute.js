const express = require("express");
const { register } = require("../controllers/authController"); // تابع register
const router = express.Router();

router.post("/register", register); // ✔ استفاده از همان نام

module.exports = router;
