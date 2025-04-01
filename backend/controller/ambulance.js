import Ambulance from "../model/ambulance.js";
import Emergency from "../model/emergency.js";
import { assignAmbulance } from "../model/genai.mjs";
import { connectDB } from "../model/db.mjs";
import mongoose from "mongoose";

export const updateAmbulanceStatus = async (req, res) => {
    try {
        await connectDB();
        const { id, status } = req.body;
        console.log(id, ":", status);

        // ✅ Update ambulance status efficiently
        const ambulance = await Ambulance.findOneAndUpdate(
            { id: id },
            { status: status },
            { new: true }
        );

        if (!ambulance) {
            return res.status(404).json({ message: "Ambulance not found" });
        }

        // ✅ If ambulance is now available, check for queued emergencies
        if (status === "available") {
            console.log("Checking for queued emergencies...");

            await executeWithRetry(async (session) => {
                const queuedEmergency = await Emergency.findOne({ ambulanceQueue: true })
                    .sort({ createdAt: 1 })
                    .session(session);

                if (queuedEmergency) {
                    const assignedAmbulance = await assignAmbulance(queuedEmergency._id);
                    if (assignedAmbulance) {
                        await Emergency.updateOne(
                            { _id: queuedEmergency._id },
                            {
                                status: "assigned",
                                assignedAmbulance: assignedAmbulance._id
                            },
                            { session }
                        );
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Ambulance status updated successfully",
            data: ambulance
        });

    } catch (error) {
        console.error('Error updating ambulance status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// ✅ Retry mechanism for transient errors
async function executeWithRetry(operation, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const result = await operation(session);
            await session.commitTransaction();
            session.endSession();
            return result;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            if (error.code === 112 && attempt < retries) {
                console.log(`Write conflict detected. Retrying... Attempt ${attempt}`);
                await new Promise(resolve => setTimeout(resolve, 200 * attempt)); // Exponential backoff
            } else {
                throw error;
            }
        }
    }
}



export const getAssignedEmergency = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;

        const ambulance = await Ambulance.findOne({ id: id });
        if (!ambulance) {
            return res.status(404).json({ message: "Ambulance not found" });
        }

        if (!ambulance.assignedEmergency) {
            return res.status(404).json({ message: "No assigned emergency found" });
        }

        const assignedEmergency = await Emergency.findById(ambulance.assignedEmergency);
        if (!assignedEmergency) {
            return res.status(404).json({ message: "Assigned emergency not found" });
        }

        res.status(200).json({
            success: true,
            message: "Assigned emergency retrieved successfully",
            data: assignedEmergency
        });
    } catch (error) {
        console.error("Error retrieving assigned emergency:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

export const completeEmergency = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.body;

        const ambulance = await Ambulance.findOne({ id: id });
        if (!ambulance) {
            return res.status(404).json({ message: "Ambulance not found" });
        }

        ambulance.status = "available";
        ambulance.assignedEmergency = null; // Clear the assigned emergency
        await ambulance.save();

        res.status(200).json({
            success: true,
            message: "Emergency completed, ambulance is now available",
        });
    } catch (error) {
        console.error("Error completing emergency:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};
