// middleware/authMiddleware.js
import passport from "passport";

// Authenticate JWT token
export const authenticateJWT = passport.authenticate("jwt", { session: false });

// Authorization middleware for different roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden - Insufficient permissions" });
    }

    next();
  };
};

// Middleware for read-only access
export const readOnlyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - No user found" });
  }

  if (
    req.user.role === "staff" &&
    req.method !== "GET" &&
    req.path !== "/logout"
  ) {
    return res
      .status(403)
      .json({ message: "Staff members have read-only access" });
  }

  next();
};

// Initialize system admin if none exists
export const initializeSystemAdmin = async () => {
  try {
    const { default: User } = await import("../models/userModel.js");
    const systemAdminCount = await User.countDocuments({ role: "systemAdmin" });

    if (systemAdminCount === 0) {
      const systemAdmin = new User({
        username: process.env.DEFAULT_SYSTEM_ADMIN_USERNAME,
        password: process.env.DEFAULT_SYSTEM_ADMIN_PASSWORD,
        role: "systemAdmin",
      });

      await systemAdmin.save();
      console.log("✅ System Admin created successfully");
    } else {
      console.log("✅ System Admin already exists, no need to create");
    }
  } catch (error) {
    console.error("❌ Error initializing System Admin:", error);
  }
};
