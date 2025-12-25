// import Voter from "../models/Voter.js";

// // Compare face and login
// export const faceLogin = async (req, res) => {
//   try {
//     const { descriptor } = req.body;

//     if (!descriptor)
//       return res.status(400).json({ message: "Descriptor missing" });

//     const voters = await Voter.find({});
//     if (!voters.length) return res.json({ success: false, message: "No voter registered" });

//     let bestMatch = null;
//     let lowest = Infinity;

//     voters.forEach(v => {
//       let dist = euclidean(v.faceDescriptor, descriptor);
//       if (dist < lowest) {
//         lowest = dist;
//         bestMatch = v;
//       }
//     });

//     if (lowest < 0.45) {
//       return res.json({
//         success: true,
//         message: "Face Login Successful",
//         voterId: bestMatch.voterId,
//       });
//     }

//     res.json({ success: false, message: "Face Not Matched" });

//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// // Euclidean formula
// function euclidean(a, b) {
//   return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
// }
