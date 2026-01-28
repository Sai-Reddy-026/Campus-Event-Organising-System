import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    employeeId: { type: String, required: true },
    role: { type: String, default: "faculty" }
});

export default mongoose.model("Faculty", facultySchema);