const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const {
  registerValidation,
  loginValidation,
} = require("../validations/authValidation");

exports.register = async (req, res) => {
  try {
    const { error, value } = registerValidation(req.body);
    const { name, username, email, password, phone } = value;

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }

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
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { error, value } = loginValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }
    const { email, password } = value;
    const user = await User.findOne({ email }).select(
      "+hashPassword +refreshToken"
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.hashPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// logout controller
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
      error: err.message,
    });
  }
};

// get me
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
      error: err.message,
    });
  }
};

//refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, username, phone, profile } = req.body;

    if (name) user.name = name;
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (profile) user.profile = profile;

    await user.save();

    res.status(200).json({
      success: true,
      user: user.toJSON(),
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
