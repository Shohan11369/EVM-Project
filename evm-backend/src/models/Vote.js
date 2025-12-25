import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  voterId: String,
  candidate: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Vote", voteSchema);
