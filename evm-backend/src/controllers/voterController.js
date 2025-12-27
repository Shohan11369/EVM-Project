import Voter from "../models/Voter.js";

function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// 1. New Voter Registration
export const signupVoter = async (req, res) => {
  try {
    const {
      name,
      voterId,
      mobile,
      postCode,
      address,
      division,
      faceEncoding,
      image,
    } = req.body;

    // Validate Inputs (Updated with new fields)
    if (
      !name ||
      !voterId ||
      !mobile ||
      !postCode ||
      !address ||
      !division ||
      !faceEncoding ||
      !image
    ) {
      return res.json({
        success: false,
        message:
          "Please provide all required fields including Mobile and Post Code.",
      });
    }

    const existingVoter = await Voter.findOne({ voterId });
    if (existingVoter) {
      return res.json({
        success: false,
        message: "This Voter ID is already registered!",
      });
    }

    // Biometric Check
    const allVoters = await Voter.find({});
    for (let v of allVoters) {
      const dist = euclidean(v.faceEncoding, faceEncoding);
      if (dist < 0.6) {
        return res.json({
          success: false,
          message: "Biometric Error: Face already registered!",
        });
      }
    }

    const voter = new Voter({
      name,
      voterId,
      mobile, // Save Mobile Number
      postCode, // Save Post Code
      address,
      division,
      faceEncoding,
      image,
    });

    await voter.save();
    res.json({ success: true, message: "Voter record saved successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + err.message });
  }
};

// 2. Face Login (Match face without ID)
export const faceLogin = async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor) {
      return res.json({
        success: false,
        message: "Face data is required for login.",
      });
    }

    const allVoters = await Voter.find({});
    let matchedVoter = null;
    let minDistance = 0.6;

    for (let voter of allVoters) {
      const dist = euclidean(voter.faceEncoding, descriptor);
      if (dist < minDistance) {
        minDistance = dist;
        matchedVoter = voter;
      }
    }

    if (!matchedVoter) {
      return res.json({
        success: false,
        message: "Face not recognized! Please register first.",
      });
    }

    if (matchedVoter.hasVoted) {
      return res.json({
        success: false,
        message: "Access Denied: You have already cast your vote!",
      });
    }

    return res.json({ success: true, voter: matchedVoter });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + err.message });
  }
};

// 3. Submit Vote
export const submitVote = async (req, res) => {
  try {
    const { voterId, candidate } = req.body;
    const voter = await Voter.findOne({ voterId });

    if (!voter)
      return res.json({ success: false, message: "Voter not found." });
    if (voter.hasVoted)
      return res.json({ success: false, message: "Warning: Already voted!" });

    await Voter.findOneAndUpdate(
      { voterId },
      { hasVoted: true, votedFor: candidate }
    );
    res.json({
      success: true,
      message: "Your vote has been recorded successfully.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Database Error: " + err.message });
  }
};

// 4. Results
export const getResults = async (req, res) => {
  try {
    const results = await Voter.aggregate([
      { $match: { hasVoted: true } },
      { $group: { _id: "$votedFor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
};

// 5. Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    if (
      adminId === process.env.ADMIN_ID &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.json({ success: true, message: "Welcome Admin" });
    } else {
      return res.json({
        success: false,
        message: "Invalid Admin ID or Password!",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
