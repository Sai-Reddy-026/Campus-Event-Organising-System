import express from "express";
const router = express.Router();
import Student from "../models/student.js";
import Faculty from "../models/faculty.js";
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const Model = role === "faculty" ? Faculty : Student;
    const user = await Model.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: `${role} not found` });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ 
      message: `${role} login successful!`, 
      user: {
        id: user._id,
        username: user.username,
        role: role 
      }
    }); 

  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

export default router;