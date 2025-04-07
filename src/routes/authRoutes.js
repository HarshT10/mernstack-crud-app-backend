// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  deleteUser,
  getCurrentUser,
} from "../controllers/authController.js";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);

// Protected routes
router.post(
  "/register",
  authenticateJWT,
  authorizeRoles("systemAdmin", "admin"),
  registerUser
);
router.get(
  "/users",
  authenticateJWT,
  authorizeRoles("systemAdmin", "admin"),
  getUsers
);
router.delete(
  "/users/:userId",
  authenticateJWT,
  authorizeRoles("systemAdmin", "admin"),
  deleteUser
);
router.get("/current-user", authenticateJWT, getCurrentUser);
router.post("/logout", authenticateJWT, logoutUser);

export default router;
