import Voter from "../models/Voter.js";

// Euclidean distance function
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
      address,
      division,
      district,
      upazila,
      postCode,
      faceEncoding,
      image,
    } = req.body;

    // Validation
    if (
      !name ||
      !voterId ||
      !mobile ||
      !address ||
      !division ||
      !district ||
      !upazila ||
      !postCode ||
      !faceEncoding ||
      !image
    ) {
      return res.json({
        success: false,
        message: "Please provide all required fields.",
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
      if (dist < 0.45) {
        return res.json({
          success: false,
          message: "Biometric Error: Face already registered!",
        });
      }
    }

    const voter = new Voter({
      name,
      voterId,
      mobile,
      address,
      division,
      district,
      upazila,
      postCode,
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

// 2. Face Login (Updated for Personal Name Display)
export const faceLogin = async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor)
      return res.json({ success: false, message: "Face data is required." });

    const allVoters = await Voter.find({});
    let matchedVoter = null;
    let minDistance = 0.5;

    for (let voter of allVoters) {
      const dist = euclidean(voter.faceEncoding, descriptor);
      if (dist < minDistance) {
        minDistance = dist;
        matchedVoter = voter;
      }
    }

    if (!matchedVoter) {
      return res.json({ success: false, message: "Face not recognized! Registration first." });
    }

    // check with name
    if (matchedVoter.hasVoted) {
      return res.json({
        success: false,
        isVoted: true,
        voterName: matchedVoter.name, 
        message: `Hello ${matchedVoter.name}, you already voted!`,
      });
    }

    return res.json({ success: true, voter: matchedVoter });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. Submit Vote
export const submitVote = async (req, res) => {
  try {
    const { voterId, candidate } = req.body;
    await Voter.findOneAndUpdate(
      { voterId },
      { hasVoted: true, votedFor: candidate }
    );
    res.json({ success: true, message: "Vote recorded successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database Error" });
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
    res.status(500).json({ success: false });
  }
};

// 5. Admin Login
export const adminLogin = async (req, res) => {
  const { adminId, password } = req.body;
  if (
    adminId === process.env.ADMIN_ID &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: true, message: "Welcome Admin" });
  }
  res.json({ success: false, message: "Invalid Credentials" });
};

// 6. Get All Voters
export const getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find({}).sort({ createdAt: -1 });
    res.json({ success: true, voters });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
