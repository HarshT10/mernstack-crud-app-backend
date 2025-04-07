import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
