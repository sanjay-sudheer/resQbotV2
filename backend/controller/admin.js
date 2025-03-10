import Emergency from '../model/emergency.js';
import { connectDB } from "../model/db.mjs";

export const getAllEmergencies = async (req, res) => {
    try {
        await connectDB();
        const emergencies = await Emergency.find();
        res.status(200).json({
            success: true,
            count: emergencies.length,
            data: emergencies
        });
    } catch (error) {
        console.error('Error fetching emergencies:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};