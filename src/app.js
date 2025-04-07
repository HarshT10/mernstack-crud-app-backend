import express from "express";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import routes
import orderRoutes from "./routes/orderRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Import middleware
import {
  readOnlyAccess,
  initializeSystemAdmin,
} from "./middleware/authMiddleware.js";

// Import passport config
import "./config/passport.js";

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mernstack-crud-app-frontend.vercel.app/",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Connect to DB before middleware
import connectDB from "./config/db.js";
connectDB();

// Initialize system admin if none exists
await initializeSystemAdmin();

// Apply read-only middleware globally
// app.use(readOnlyAccess);

//Routes
app.use("/orders", orderRoutes);
app.use("/companies", companyRoutes);
app.use("/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Root Route
app.get("/", (req, res) => {
  res.send("Hello, Printage Backend is running!");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
