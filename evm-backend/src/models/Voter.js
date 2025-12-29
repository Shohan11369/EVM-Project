import mongoose from "mongoose";

const voterSchema = new mongoose.Schema(
  {
    voterId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    postCode: { type: String, required: true }, 
    address: { type: String, required: true },
    image: { type: String, required: true },
    faceEncoding: { type: [Number], required: true },
    hasVoted: { type: Boolean, default: false },
    votedFor: { type: String, default: null },
  },
  { timestamps: true }
);

const Voter = mongoose.model("Voter", voterSchema);
export default Voter;