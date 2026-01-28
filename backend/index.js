import express from "express";
import cors from "cors"; 
import mongoose from "mongoose"; 
import Student from "./models/student.js"; 
import Faculty from "./models/faculty.js"; 

const app = express();
app.use(cors()); 
app.use(express.json()); 

mongoose.connect("mongodb://127.0.0.1:27017/university_db")
  .then(() => console.log("✅ Connected to Local MongoDB"))
  .catch((err) => console.error("❌ Connection Error:", err));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullname, email, username, password, role, rollNumber, employeeId } = req.body;
    
    const Model = role === "faculty" ? Faculty : Student;

    const existingUser = await Model.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists in this role" });
    const newUser = new Model({ 
      fullname, 
      email, 
      username, 
      password,
      role,
      rollNumber,
      employeeId 
    });

    await newUser.save();

    res.status(201).json({ message: `${role} registered successfully!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const Model = role === "faculty" ? Faculty : Student;
    const user = await Model.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials for selected role" });
    }

    res.status(200).json({ 
      message: `${role} login successful`, 
      user: { 
        username: user.username, 
        id: user._id, 
        role: role,
        fullname: user.fullname 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));