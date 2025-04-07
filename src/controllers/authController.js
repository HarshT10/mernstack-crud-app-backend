// controllers/authController.js
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import passport from "passport";

// Register a new user (admin or staff)
export const registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if the logged-in user has permission to create this role
    const loggedInUserId = req.user._id;
    const loggedInUser = await User.findById(loggedInUserId);

    if (loggedInUser.role === "staff") {
      return res
        .status(403)
        .json({ message: "Staff members cannot create users" });
    }

    if (loggedInUser.role === "admin" && role === "systemAdmin") {
      return res
        .status(403)
        .json({ message: "Admin cannot create a System Admin" });
    }

    if (loggedInUser.role === "admin" && role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin cannot create another Admin" });
    }

    // Create the new user
    const newUser = new User({
      username,
      password,
      role,
      createdBy: loggedInUserId,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Login user
export const loginUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Authentication failed" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 3600000,
    });

    return res.status(200).json({
      message: "Authentication successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  })(req, res, next);
};

// Get all users (for admin pages)
export const getUsers = async (req, res) => {
  try {
    // Only system admin and admin can get user lists
    if (req.user.role === "staff") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Determine which users to fetch based on role
    let query = {};
    if (req.user.role === "admin") {
      // Admins can only see staff they created
      query = { role: "staff", createdBy: req.user._id };
    }

    const users = await User.find(query).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user to delete
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check permissions
    if (req.user.role === "staff") {
      return res.status(403).json({ message: "Staff cannot delete users" });
    }

    if (
      req.user.role === "admin" &&
      (userToDelete.role === "admin" || userToDelete.role === "systemAdmin")
    ) {
      return res
        .status(403)
        .json({ message: "Admin cannot delete other admins or system admin" });
    }

    // Check if the user created this user or is system admin
    if (
      req.user.role === "admin" &&
      !userToDelete.createdBy.equals(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "Cannot delete users you did not create" });
    }

    // Cannot delete the only system admin
    if (userToDelete.role === "systemAdmin") {
      const systemAdminCount = await User.countDocuments({
        role: "systemAdmin",
      });
      if (systemAdminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the only system admin" });
      }
    }

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Logout user
export const logoutUser = (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged out successfully" });
};

// Get current user info
export const getCurrentUser = (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
    },
  });
};
