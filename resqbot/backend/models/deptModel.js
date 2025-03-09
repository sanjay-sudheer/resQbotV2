const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const deptSchema = new mongoose.Schema({
  dept_id: { type: String, required: true, unique: true },
  password: { type: String },
  department_name: { type: String, ref: "Department" },
});

// Hash password before saving


const Dept = mongoose.model("Dept", deptSchema);
module.exports = Dept;

