import Address from "../models/Address.js";

export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find();
    res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};