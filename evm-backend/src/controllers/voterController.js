import Voter from "../models/Voter.js";

function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// SIGNUP
export const signupVoter = async (req, res) => {
  try {
    const { name, voterId, faceEncoding } = req.body;
    if (!name || !voterId || !faceEncoding) return res.json({ success: false, message: "Missing data" });

    const existingID = await Voter.findOne({ voterId });
    if (existingID) return res.json({ success: false, message: "This Voter ID is already registered" });

    const allVoters = await Voter.find({});
    for (let v of allVoters) {
      const dist = euclidean(v.faceEncoding, faceEncoding);
      if (dist < 0.6) return res.json({ success: false, duplicateFace: true, message: "Security Alert: This face is already registered!" });
    }

    const voter = new Voter({ name, voterId, faceEncoding });
    await voter.save();
    res.json({ success: true, message: "Voter registered successfully" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// FACE LOGIN 
export const faceLogin = async (req, res) => {
  try {
    const { descriptor } = req.body;
    const voters = await Voter.find({});
    let bestMatch = null;
    let lowestDistance = Infinity;

    voters.forEach((voter) => {
      const dist = euclidean(voter.faceEncoding, descriptor);
      if (dist < lowestDistance) {
        lowestDistance = dist;
        bestMatch = voter;
      }
    });

    if (lowestDistance < 0.6) {
      if (bestMatch.hasVoted) {
        return res.json({ success: false, hasVoted: true, message: "You have already cast your vote!" });
      }
      return res.json({ success: true, voterId: bestMatch.voterId, hasVoted: false });
    }
    res.json({ success: false, message: "Face not recognized" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

//  VOTE  
export const submitVote = async (req, res) => {
  try {
    const { voterId, candidate } = req.body; // candidate name from frontend

    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.json({ success: false, message: "Voter not found" });
    if (voter.hasVoted) return res.json({ success: false, message: "Already voted" });

    // name save
    voter.hasVoted = true;
    voter.votedFor = candidate; 
    await voter.save();

    res.json({ success: true, message: `Vote for ${candidate} submitted successfully` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// === GET RESULTS  ===
export const getResults = async (req, res) => {
  try {
    const results = await Voter.aggregate([
      { $match: { hasVoted: true } }, 
      { $group: { _id: "$votedFor", count: { $sum: 1 } } } 
    ]);
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};