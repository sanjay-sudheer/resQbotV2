import dotenv from 'dotenv';

dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
import { connectDB } from "./db.mjs";
import Emergency from "./emergency.js";



const saveEmergencyData = async (data, latitude, longitude) => {
  try {
    const emergencyData = {
      ...data,
      latitude: latitude,
      longitude: longitude
    };
    const emergency = new Emergency(emergencyData);
    await emergency.save();

    console.log('Emergency data saved:', emergency);
  } catch (err) {
    console.error('Error saving emergency data:', err.message);
  }
};



export const handleEmergency = async (transcription,latitude,longitude) => {
  connectDB();
  const prompt = `
  You are a helpful assistant. Extract the problem, including the place or location if mentioned, and the priority (low, medium, high (set the only in full lowercased letters)) based on the threat to human life, women safety, child harassment. Also consider setting medium priority in a sensible manner, and determine a department to the respond to the problem from this array ['police', 'medical', 'fire', 'municipal', 'traffic'], from the following transcription. Return the extracted information strictly in JSON format as plain text:
  "${transcription}"
  
  Format:
  {
    "problem": "",
    "priority": "",
    "department": ""
  }
  `;

  const result = await model.generateContent(prompt);
  const cleanedRes = result.response.text().replace(/```json|```/g, '').trim();
  await saveEmergencyData(JSON.parse(cleanedRes),latitude,longitude);
  console.log(JSON.parse(cleanedRes));
}








