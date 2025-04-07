import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    jobNumber: Number,
    jobType: String,
    companyName: String,
    jobName: String,
    jobQuantity: String,
    size: String,
    rate: String,
    papersAndColorsOfPapers: String,
    quantityAndSizeToRunOnMachine: String,
    colorOfInk: String,
    numbering: String,
    punching: String,
    perforation: String,
    lamination: String,
    fixedCopy: String,
    typeOfBinding: String,
    specialNote: String,
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
