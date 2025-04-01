import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "./db.mjs";
import Emergency from "./emergency.js";
import Ambulance from './ambulance.js';
import mongoose from "mongoose";

dotenv.config();
connectDB();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const saveEmergencyData = async (data, latitude, longitude) => {
    try {
        const emergencyData = {
            ...data,
            latitude,
            longitude,
            status: 'pending',  // Ensure status is set
            timestamp: new Date()
        };
        const emergency = new Emergency(emergencyData);
        const savedEmergency = await emergency.save();

        console.log('✅ Emergency data saved:', savedEmergency);
        return savedEmergency;  // Ensure the saved document is returned
    } catch (err) {
        console.error('❌ Error saving emergency data:', err.message);
        throw err;
    }
};

export const handleEmergency = async (transcription, latitude, longitude) => {
    try {
        const prompt = `
        You are a helpful assistant. Extract the problem, including the place or location if mentioned, and the priority (low, medium, high (set only in full lowercase letters)) based on the threat to human life, women safety, child harassment. Also, determine a department from this list: ['police', 'medical', 'fire', 'municipal', 'traffic']. Wisely set the ambluance field as true/false by deciding if there is a an urgent need for ambulance(other than health departments like any emergencies may need ambulance consider that also). Return the extracted information in JSON format:
        "${transcription}"

        Format:
        {
            "problem": "",
            "priority": "",
            "department": "",
            "ambulance": false,
        }
        `;

        const result = await model.generateContent(prompt);
        const cleanedRes = result.response.text().replace(/```json|```/g, '').trim();
        const extractedData = JSON.parse(cleanedRes);

        return await saveEmergencyData(extractedData, latitude, longitude);
    } catch (error) {
        console.error('❌ Error processing emergency:', error);
        throw error;
    }
};

export const assignAmbulance = async (emergencyId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const ambulance = await Ambulance.findOne({ status: "available" }).session(session);
        const emergency = await Emergency.findById(emergencyId).session(session);

        if (!ambulance) {
            console.log("No available ambulances found. Adding to queue...");
            
            if (emergency) {
                emergency.ambulanceQueue = true; 
                await emergency.save({ session });  // Save inside transaction
                console.log("🚨 Emergency added to ambulance queue:", emergencyId);
            } else {
                console.error("❌ Emergency not found for queuing:", emergencyId);
            }

            await session.commitTransaction();
            session.endSession();
            return null; 
        }

        // Update ambulance status
        ambulance.status = "assigned";
        ambulance.assignedEmergency = emergencyId;
        await ambulance.save({ session });

        // Update emergency
        emergency.ambulanceQueue = false; 
        await emergency.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        console.log("🚑 Ambulance assigned:", ambulance);
        return ambulance;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Error assigning ambulance:", error);
        throw error;
    }
};
