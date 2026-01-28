import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

export default mongoose.model("Faculty", facultySchema);
