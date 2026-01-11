const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
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
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
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
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while refreshing token",
      error: err.message,
    });
  }
};

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const { error } = updateProfileValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { name, username, phone, profile } = req.body;
    const updates = { name, username, phone, profile };

    if (username) {
      const exist = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (exist) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }
    }
    if (phone) {
      const exist = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (exist) {
        return res
          .status(400)
          .json({ success: false, message: "Phone number already in use" });
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: updatedUser.toJSON(),
      message: "Profile updated successfully",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
