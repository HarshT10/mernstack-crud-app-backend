import Order from "../models/orderModel.js";
import mongoose from "mongoose";

const getNextJobNumber = async () => {
  const lastOrder = await Order.findOne().sort({ jobNumber: -1 }).exec();
  return lastOrder ? Math.max(lastOrder.jobNumber + 1, 4001) : 4001;
};

export const getOrders = async (req, res) => {
  try {
    let { page = 1, limit = 15, search, jobNumber, jobName } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 15;
    const skip = (page - 1) * limit;

    let searchQuery = {};

    if (jobNumber && jobNumber.trim() !== "") {
      const jobNum = Number(jobNumber);
      if (!isNaN(jobNum)) {
        searchQuery.jobNumber = jobNum;
      }
    }

    if (search) {
      const formattedSearch = search.toLowerCase();

      if (["pending", "completed"].includes(formattedSearch)) {
        searchQuery.status = new RegExp(`^${formattedSearch}$`, "i");
      } else {
        searchQuery.companyName = { $regex: search, $options: "i" };
      }
    }

    if (jobName) {
      searchQuery.jobName = { $regex: jobName, $options: "i" };
    }

    const orders = await Order.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      totalOrders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
};

export const createOrder = async (req, res) => {
  try {
    const nextJobNumber = await getNextJobNumber();
    const newOrder = new Order({ ...req.body, jobNumber: nextJobNumber });
    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", orderId: newOrder.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
};

export const copyOrder = async (req, res) => {
  try {
    const existingOrder = await Order.findById(req.params.orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    const nextJobNumber = await getNextJobNumber();
    const copiedOrder = new Order({
      ...existingOrder.toObject(),
      _id: mongoose.Types.ObjectId(),
      jobNumber: nextJobNumber,
      createdAt: undefined,
      updatedAt: undefined,
    });
    await copiedOrder.save();
    res.status(201).json({
      message: "Order copied successfully",
      newOrderId: copiedOrder.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error copying order", error });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      req.body,
      { new: true }
    );
    if (updatedOrder) {
      res.json({ message: "Order updated successfully", updatedOrder });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
    if (deletedOrder) {
      res.json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting order", error });
  }
};
