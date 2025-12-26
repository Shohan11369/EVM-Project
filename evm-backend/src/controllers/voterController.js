import Voter from "../models/Voter.js";

function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// SIGNUP (With Auto-ID Logic) 
export const signupVoter = async (req, res) => {
  try {
    const { name, division, faceEncoding } = req.body;

    if (!name || !division || !faceEncoding) {
      return res.json({
        success: false,
        message: "Missing data (Name, Division or Face)",
      });
    }

    // 1. Security Check
    const allVoters = await Voter.find({});
    for (let v of allVoters) {
      const dist = euclidean(v.faceEncoding, faceEncoding);
      if (dist < 0.6) {
        return res.json({
          success: false,
          duplicateFace: true,
          message: "Security Alert: This face is already registered!",
        });
      }
    }

    // 2. Unique ID Generation Logic
    const divCode = division.substring(0, 3).toUpperCase();
    const lastVoter = await Voter.findOne({ division }).sort({ createdAt: -1 });

    let newVoterId;
    if (!lastVoter) {
      newVoterId = `${divCode}-1001`;
    } else {
      const lastIdParts = lastVoter.voterId.split("-");
      const lastNumber = parseInt(lastIdParts[1]);
      newVoterId = `${divCode}-${lastNumber + 1}`;
    }

    const voter = new Voter({
      name,
      division,
      voterId: newVoterId,
      faceEncoding,
    });

    await voter.save();

    res.json({
      success: true,
      message: "Voter registered successfully",
      voterId: newVoterId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// FACE LOGIN (Updated: ID + Face Verification)
export const faceLogin = async (req, res) => {
  try {
    const { voterId, descriptor } = req.body; //  voterId and descriptor from frontend

    if (!voterId || !descriptor) {
      return res.json({ success: false, message: "Voter ID and Face scan required" });
    }

    // ১. check voter id
    const voter = await Voter.findOne({ voterId: voterId.toUpperCase() });

    if (!voter) {
      return res.json({ success: false, message: "Invalid Voter ID! Voter not found." });
    }

    // 2. voter face encoding
    const dist = euclidean(voter.faceEncoding, descriptor);

    // ৩. Result (Distance < 0.6 )
    if (dist < 0.6) {
      if (voter.hasVoted) {
        return res.json({
          success: false,
          hasVoted: true,
          message: "You have already cast your vote!",
        });
      }
      return res.json({
        success: true,
        voterId: voter.voterId,
        hasVoted: false,
      });
    } else {
      
      res.json({ success: false, message: "Face identity did not match with this ID!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// VOTE (Same as before)
export const submitVote = async (req, res) => {
  try {
    const { voterId, candidate } = req.body;
    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.json({ success: false, message: "Voter not found" });
    if (voter.hasVoted)
      return res.json({ success: false, message: "Already voted" });

    voter.hasVoted = true;
    voter.votedFor = candidate;
    await voter.save();

    res.json({
      success: true,
      message: `Vote for ${candidate} submitted successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET RESULTS (Same as before)
export const getResults = async (req, res) => {
  try {
    const results = await Voter.aggregate([
      { $match: { hasVoted: true } },
      { $group: { _id: "$votedFor", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};