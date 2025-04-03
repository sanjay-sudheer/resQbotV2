import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Dept from "../model/deptModel.js";
import Ambulance from "../model/ambulance.js";
import {connectDB} from "../model/db.mjs";

dotenv.config();

// **User Login Controller**
export const login = async (req, res) => {
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

export const amblogin = async (req, res) => {
  try {
      await connectDB();

      const { id } = req.body;
      if (!id) {
          console.warn("No Ambulance ID provided");
          return res.status(400).json({ success: false, message: "Ambulance ID is required" });
      }

      console.log("🔹 Searching for Ambulance ID:", id);

      // ✅ Convert `id` to Number before querying the database
      const ambulance = await Ambulance.findOne({ id: Number(id) });

      if (!ambulance) {
          console.warn("Ambulance not found for ID:", id);
          return res.status(404).json({ success: false, message: "Ambulance not found" });
      }

      console.log("Login successful for Ambulance:", ambulance);

      res.status(200).json({
          success: true,
          message: "Login successful",
          ambulance: {
              id: ambulance.id,
              status: ambulance.status,
          }
      });

  } catch (error) {
      console.error(" Error in ambulance login:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

