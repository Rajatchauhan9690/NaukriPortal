import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let profilePhoto = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const upload = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = upload.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      role,
      profile: { profilePhoto },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   LOGIN (COOKIE FIXED)
========================= */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== role) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: `Welcome back ${user.fullname}`,
        user,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  return res
    .cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { fullname, bio, skills } = req.body;

    if (fullname) user.fullname = fullname;
    user.profile.bio = bio || user.profile.bio;

    if (skills) {
      user.profile.skills = skills.split(",").map((s) => s.trim());
    }

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const upload = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "raw",
        folder: "resumes",
      });

      user.profile.resume = upload.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
