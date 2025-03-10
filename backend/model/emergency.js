import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Emergency = mongoose.model('Emergency', EmergencySchema);
export default Emergency;
