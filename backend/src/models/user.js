const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    hashPassword: {
      type: String,
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    blockAt: {
      type: Date,
      default: null,
    },

    blockedReason: {
      type: String,
      default: null,
    },

    profile: {
      type: String,
      default: "https://www.freeiconspng.com/uploads/profile-icon-9.png",
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true, strict: true }
);

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("hashPassword")) return next();

  this.hashPassword = await bcrypt.hash(this.hashPassword, 12);
  next();
});

// compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.hashPassword);
};

// hide sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.hashPassword;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
