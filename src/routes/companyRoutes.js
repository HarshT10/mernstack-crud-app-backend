import express from "express";
import {
  getCompanies,
  createCompany,
  updateCompany,
} from "../controllers/companyController.js";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticateJWT);

router.get("/", getCompanies);
router.post("/", authorizeRoles("systemAdmin", "admin"), createCompany);
router.put("/:id", authorizeRoles("systemAdmin", "admin"), updateCompany);

export default router;
