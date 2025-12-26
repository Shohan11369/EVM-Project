// import mongoose from "mongoose";

// const voterSchema = new mongoose.Schema({
//   voterId: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   faceEncoding: { type: [Number], required: true },
//   hasVoted: { type: Boolean, default: false },
//   votedFor: { type: String, default: null }, 
// });

// export default mongoose.model("Voter", voterSchema);


import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  division: { type: String, required: true }, // নতুন ফিল্ড
  faceEncoding: { type: [Number], required: true },
  hasVoted: { type: Boolean, default: false },
  votedFor: { type: String, default: null }, 
}, { timestamps: true }); // ID সিরিয়াল ঠিক রাখার জন্য এটি জরুরি

export default mongoose.model("Voter", voterSchema);