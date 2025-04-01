import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  contact: { type: Number, required: true },
  status: { type: String, default: "available" },
  assignedEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emergency",
  },
});

const Ambulance = mongoose.model("Ambulance", ambulanceSchema);

export default Ambulance;