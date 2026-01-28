import mongoose from "mongoose";
const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rollNumber: String,
});
export default mongoose.model("Student", studentSchema);