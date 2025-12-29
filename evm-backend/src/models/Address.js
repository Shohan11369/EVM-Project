import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  division: { type: String, required: true },
  district: { type: String, required: true },
  upazilas: [String]
});

const Address = mongoose.model("Address", addressSchema);
export default Address;