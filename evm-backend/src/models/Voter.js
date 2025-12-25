import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  faceEncoding: { type: [Number], required: true },
  hasVoted: { type: Boolean, default: false },
  votedFor: { type: String, default: null }, 
});

export default mongoose.model("Voter", voterSchema);
