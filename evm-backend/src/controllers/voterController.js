import Voter from "../models/Voter.js";

/**
 * Helper Function: Euclidean Distance
 * Used to compare face descriptors (smaller distance = better match)
 */
function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// 1. New Voter Registration
export const signupVoter = async (req, res) => {
  try {
    const { name, voterId, address, division, faceEncoding } = req.body;

    // 1.1 Validate Inputs
    if (!name || !voterId || !address || !division || !faceEncoding) {
      return res.json({ success: false, message: "Please provide all required fields (Name, ID, Address, Division)." });
    }

    // 1.2 Check for Duplicate ID
    const existingVoter = await Voter.findOne({ voterId });
    if (existingVoter) {
      return res.json({ success: false, message: "This Voter ID is already registered in our database!" });
    }

    // 1.3 Check for Duplicate Face (Security check to prevent multiple accounts per person)
    const allVoters = await Voter.find({});
    for (let v of allVoters) {
      const dist = euclidean(v.faceEncoding, faceEncoding);
      if (dist < 0.6) { 
        return res.json({ success: false, message: "Biometric Error: This face is already registered under a different ID!" });
      }
    }

    // 1.4 Save New Voter
    const voter = new Voter({ 
      name, 
      voterId, 
      address, 
      division, 
      faceEncoding 
    });

    await voter.save();
    res.json({ success: true, message: "Voter record saved successfully!" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error: " + err.message });
  }
};

// 2. Automatic Face Login
export const faceLogin = async (req, res) => {
  try {
    const { descriptor, voterId } = req.body; 
    
    // Find the specific voter by ID first (for efficiency and security)
    const voter = await Voter.findOne({ voterId });

    if (!voter) {
      return res.json({ success: false, message: "Voter ID not found. Please register first." });
    }

    // Verify face against the stored encoding for this specific ID
    const distance = euclidean(voter.faceEncoding, descriptor);

    if (distance < 0.6) {
      // Check if they have already voted
      if (voter.hasVoted) {
        return res.json({ success: false, message: "Access Denied: You have already cast your vote!" });
      }
      return res.json({ success: true, voter });
    }

    res.json({ success: false, message: "Face verification failed. Please try again in better lighting." });

  } catch (err) {
    res.status(500).json({ success: false, message: "Authentication Error: " + err.message });
  }
};

// 3. Submit Vote
export const submitVote = async (req, res) => {
  try {
    const { voterId, candidate } = req.body;

    // 3.1 Security Check
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.json({ success: false, message: "Voter record not found." });
    }

    if (voter.hasVoted) {
      return res.json({ success: false, message: "Security Alert: This voter has already submitted a ballot!" });
    }

    // 3.2 Update Voter Status
    await Voter.findOneAndUpdate(
      { voterId }, 
      { hasVoted: true, votedFor: candidate }
    );

    res.json({ success: true, message: "Congratulations! Your vote has been recorded successfully." });

  } catch (err) {
    res.status(500).json({ success: false, message: "Submission Error: " + err.message });
  }
};

// 4. Election Results (Aggregated)
export const getResults = async (req, res) => {
  try {
    const results = await Voter.aggregate([
      { $match: { hasVoted: true } },
      { $group: { _id: "$votedFor", count: { $sum: 1 } } },
      { $sort: { count: -1 } } 
    ]);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch results: " + err.message });
  }
};



//admin

export const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    
    // from .env
    if (adminId === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
      return res.json({ success: true, message: "Welcome Admin" });
    } else {
      return res.json({ success: false, message: "Invalid ID or Password!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};