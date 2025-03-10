import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Dept from "../model/deptModel.js";

dotenv.config();

// **User Login Controller**
const login = async (req, res) => {
  try {
    const { id, password } = req.body;
    console.log(id, password);

    // Check if user exists
    const dept = await Dept.findOne({ dept_id: id });
    console.log(dept);
    if (!dept) return res.status(400).json({ message: "Invalid credentials" });

    // Verify password using simple string comparison
    if (password !== dept.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: dept.username },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      message: "Login successful",
      token,
      dept: {
        dept_id: dept.dept_id,
        dept_name: dept.department_name,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default { login };
