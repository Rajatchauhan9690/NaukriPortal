import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

/* =========================
   REGISTER CONTROLLER
========================= */
export const register = async (req, res) => {
  try {
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);

    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname)
      return res
        .status(400)
        .json({ success: false, message: "Full name is required" });

    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    if (!phoneNumber)
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });

    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });

    if (!role)
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });

    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

    const phone = Number(phoneNumber?.trim());
    if (!phoneNumber || isNaN(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a valid number",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });

    let profilePhoto = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = cloudResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber: phone,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   LOGIN CONTROLLER
========================= */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });

    if (!role)
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });

    if (user.role !== role)
      return res.status(400).json({
        success: false,
        message: "Account does not exist for this role",
      });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // cross-origin
      })
      .json({
        success: true,
        message: `Welcome back ${user.fullname}`,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profile: user.profile,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   LOGOUT CONTROLLER
========================= */
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/* =========================
   UPDATE PROFILE CONTROLLER
========================= */
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;

    if (phoneNumber) {
      const phone = Number(phoneNumber);
      if (isNaN(phone))
        return res.status(400).json({
          success: false,
          message: "Phone number must be numeric",
        });
      user.phoneNumber = phone;
    }

    // Bio update
    user.profile.bio = bio || "";

    // Skills update
    if (skills) {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      user.profile.skills = skillsArray;
    } else {
      user.profile.skills = [];
    }

    // Resume upload
    if (req.file) {
      const fileUri = getDataUri(req.file);

      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "raw",
        folder: "resumes",
        use_filename: true,
        unique_filename: false,
      });

      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = req.file.originalname;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
