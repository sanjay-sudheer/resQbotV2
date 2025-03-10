import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import stt from './model/stt.cjs';
import { handleEmergency } from './model/genai.mjs';
import Emergency from './model/emergency.js';
import { connectDB } from './model/db.mjs';

dotenv.config();
connectDB();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userLocations = new Map();
const userEmergencies = new Map();
const previousStatuses = new Map(); // Track previous statuses

// Function to send a welcome message with menu buttons
const sendWelcomeMessage = (chatId, userName) => {
    const welcomeMessage = `👋 Hello, ${userName}! Welcome to the Emergency Service Dispatch Bot. 
    Please share your location so we can assist you.`;

    const options = {
        reply_markup: {
            keyboard: [
                [{ text: '📍 Send Location', request_location: true }],
                [{ text: '🔄 Check Emergency Status' }]
            ],
            one_time_keyboard: false
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
};

// Function to ask for a voice message
const askForVoiceMessage = (chatId) => {
    bot.sendMessage(chatId, '✅ Location received! Now, please send a voice message describing the emergency.');
};

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'User';
    sendWelcomeMessage(chatId, userName);
});

// Handling location sharing
bot.on('location', async (msg) => {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;

    userLocations.set(chatId, { latitude, longitude });

    console.log(`📍 Received location: Latitude ${latitude}, Longitude ${longitude}`);

    bot.sendMessage(chatId, '✅ Location received. Our team is on the way to assist you.');
    askForVoiceMessage(chatId);
});

// Handling voice messages
bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;

    if (!userLocations.has(chatId)) {
        bot.sendMessage(chatId, '❗ Please share your location first.');
        return;
    }

    const { latitude, longitude } = userLocations.get(chatId);
    const fileId = msg.voice.file_id;

    try {
        const file = await bot.getFile(fileId);
        const filePath = file.file_path;

        const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const text = await stt(url);
        const emergencyData = await handleEmergency(text, latitude, longitude);

        if (!emergencyData || !emergencyData._id) {
            bot.sendMessage(chatId, '❌ Error reporting emergency. Please try again.');
            return;
        }

        userEmergencies.set(chatId, emergencyData._id);
        previousStatuses.set(emergencyData._id.toString(), emergencyData.status); // Store initial status

        bot.sendMessage(chatId, '🎤 Voice note received! Our team is reviewing your emergency.');
    } catch (error) {
        console.error('❌ Error handling voice note:', error);
        bot.sendMessage(chatId, '⚠️ Sorry, there was an error processing your voice note.');
    }
});

// Function to check and notify status changes
const checkForStatusUpdates = async () => {
    try {
        const emergencies = await Emergency.find({ status: { $ne: "resolved" } });

        for (const emergency of emergencies) {
            const emergencyId = emergency._id.toString();
            const newStatus = emergency.status;
            const oldStatus = previousStatuses.get(emergencyId);

            if (oldStatus !== newStatus) {
                // Status changed, notify user
                const chatId = [...userEmergencies.entries()].find(([_, id]) => id.equals(emergency._id))?.[0];

                if (chatId) {
                    bot.sendMessage(chatId, `⚠️ Update: Your emergency report (${emergency.problem}) is now '${newStatus}'.`);
                    previousStatuses.set(emergencyId, newStatus); // Update stored status
                }

                // Remove from tracking if resolved
                if (newStatus === "resolved") {
                    userEmergencies.delete(chatId);
                    previousStatuses.delete(emergencyId);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error checking emergency status:", error);
    }
};

// Manually check status when the user clicks the button
bot.on('message', async (msg) => {
    if (msg.text === '🔄 Check Emergency Status') {
        const chatId = msg.chat.id;

        if (!userEmergencies.has(chatId)) {
            bot.sendMessage(chatId, 'ℹ️ No active emergency reports found.');
            return;
        }

        const emergencyId = userEmergencies.get(chatId);
        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            bot.sendMessage(chatId, '⚠️ Error fetching emergency details.');
            return;
        }

        bot.sendMessage(chatId, `📋 Your emergency report (${emergency.problem}) is currently '${emergency.status}'.`);
    }
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'ℹ️ You can use the following commands:\n/start - Start the bot\n/help - Get help');
});

// Run status check in the background
setInterval(checkForStatusUpdates, 5000);
console.log('🚀 Bot is running!');