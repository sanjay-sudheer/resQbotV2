import mongoose from "mongoose";

const deptSchema = new mongoose.Schema({
  dept_id: { type: String, required: true, unique: true },
  password: { type: String },
  department_name: { type: String},
});

const Dept = mongoose.model("Dept", deptSchema);

export default Dept;
