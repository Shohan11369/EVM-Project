import mongoose from "mongoose";

const adminCredentialSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AdminCredential", adminCredentialSchema);
