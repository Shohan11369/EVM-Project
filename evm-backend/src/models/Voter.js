
import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true }, 
  division: { type: String, required: true },
  faceEncoding: { type: [Number], required: true },
  hasVoted: { type: Boolean, default: false },
  votedFor: { type: String, default: null }, 
}, { timestamps: true }); 

export default mongoose.model("Voter", voterSchema);