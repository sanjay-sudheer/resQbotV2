import TelegramBot from 'node-telegram-bot-api';
import stt from './model/stt.cjs';
import { handleEmergency } from './model/genai.mjs';
import dotenv from 'dotenv';

dotenv.config();


const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const userLocations = new Map();

const sendWelcomeMessage = (chatId, userName) => {
    const welcomeMessage = `Welcome, ${userName}! This is the Emergency Service Dispatch Bot. 
    Please share your location so we can assist you.`;
    
    const options = {
        reply_markup: {
            keyboard: [[{ text: 'Send Location', request_location: true }]],
            one_time_keyboard: true
        }
    };
    
    bot.sendMessage(chatId, welcomeMessage, options);
};

const askForVoiceMessage = (chatId) => {
    const message = `Thank you for providing your location. Please send a voice message describing the emergency.`;

    bot.sendMessage(chatId, message);
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'User';
    sendWelcomeMessage(chatId, userName);
});

bot.on('location', async (msg) => {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;

    userLocations.set(chatId, { latitude, longitude });

    console.log(`Received location: Latitude ${latitude}, Longitude ${longitude}`);

    bot.sendMessage(chatId, 'Location received. Our team is on the way to assist you.');
    
    askForVoiceMessage(chatId);
});

bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;


    const location = userLocations.get(chatId);
    if (!location) {
        bot.sendMessage(chatId, 'Please share your location first.');
        return;
    }

    const { latitude, longitude } = location;

 
    const fileId = msg.voice.file_id;

    try {
        const file = await bot.getFile(fileId);
        const filePath = file.file_path;

        const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
       
        const text = await stt(url);
        await handleEmergency(text, latitude, longitude);
        bot.sendMessage(chatId, 'Voice note received. Our team is reviewing your emergency.');

    } catch (error) {
        console.error('Error handling voice note:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error processing your voice note.');
    }
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'You can use the following commands:\n/start - Start the bot\n/help - Get help');
});