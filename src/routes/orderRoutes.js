import express from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  copyOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticateJWT);

router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.post("/", authorizeRoles("systemAdmin", "admin"), createOrder);
router.post(
  "/:orderId/copy",
  authorizeRoles("systemAdmin", "admin"),
  copyOrder
);
router.put("/:orderId", authorizeRoles("systemAdmin", "admin"), updateOrder);
router.delete("/:orderId", authorizeRoles("systemAdmin", "admin"), deleteOrder);

export default router;
