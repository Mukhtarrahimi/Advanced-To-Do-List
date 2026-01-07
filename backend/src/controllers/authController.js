const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      username,
      email,
      phone,
      hashPassword: password,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err, "here is the error");
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
