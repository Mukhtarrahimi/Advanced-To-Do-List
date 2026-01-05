import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

// Register new user

exports.register = async(req, res) => {
    try {
        const { name, username, email, password, phone } = req.body;

        // check if user exists
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
            user,
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
