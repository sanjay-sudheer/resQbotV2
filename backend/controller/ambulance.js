import Ambulance from "../model/ambulance";
import Emergency from "../model/emergency";
import { assignAmbulance } from "../model/genai.mjs";
import { connectDB } from "../model/db.mjs";

export const updateAmbulanceStatus = async (req, res) => {
    try {
        await connectDB();
        const { id, status } = req.body;
        console.log(id, status);
        const ambulance = await Ambulance.findById(id);
        if (!ambulance) {
            return res.status(404).json({ message: "Ambulance not found" });
        }
        ambulance.status = status;
        await ambulance.save();

        if (status === "available") {
            const queuedEmergency = await Emergency.findOne({ status: "queued" }).sort({ createdAt: 1 });
            if (queuedEmergency) {
                const assignedAmbulance = await assignAmbulance(queuedEmergency._id);
                if (assignedAmbulance) {
                    queuedEmergency.status = "assigned";
                    queuedEmergency.assignedAmbulance = assignedAmbulance._id;
                    await queuedEmergency.save();
                }
            }
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
}

export const getAssignedEmergency = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const ambulance = await Ambulance.findById(id);

        if (!ambulance) {
            return res.status(404).json({ message: "Ambulance not found" });
        }

        const assignedEmergency = await Emergency.findOne({ assignedAmbulance: id });

        if (!assignedEmergency) {
            return res.status(404).json({ message: "No emergency assigned to this ambulance" });
        }

        res.status(200).json({
            success: true,
            message: "Assigned emergency retrieved successfully",
            data: assignedEmergency
        });
    } catch (error) {
        console.error('Error retrieving assigned emergency:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};