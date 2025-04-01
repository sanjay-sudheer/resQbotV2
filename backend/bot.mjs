import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import stt from './model/stt.cjs';
import { handleEmergency } from './model/genai.mjs';
import Emergency from './model/emergency.js';
import { connectDB } from './model/db.mjs';
import {assignAmbulance} from './model/genai.mjs';
import { response } from 'express';

dotenv.config();
connectDB();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userLocations = new Map();
const userEmergencies = new Map();
const previousStatuses = new Map(); // Track previous statuses
const userLanguages = new Map(); // Track user language preferences

// Multi-language support
const messages = {
    en: {
        welcome: (name) => `👋 Hello, ${name}! Welcome to the Emergency Assistance Bot.\n\nYou can use this service to report any type of emergency including:\n- Medical emergencies\n- Fire incidents\n- Security threats\n- Natural disasters\n- Utility failures\n- Traffic accidents\n\nPlease share your location so we can assist you.`,
        locationReceived: '✅ Location received! Now, please send a voice message describing your emergency situation in detail.',
        shareLocationFirst: '❗ Please share your location first so we can send the appropriate help to you.',
        processingError: '⚠️ Sorry, there was an error processing your request. Please try again or call emergency services directly if urgent.',
        voiceReceived: '🎤 Voice message received! Our emergency response team is reviewing your situation.',
        errorReporting: '❌ Error reporting emergency. Please try again or call emergency services directly.',
        noActiveEmergencies: 'ℹ️ You have no active emergency reports at the moment.',
        responseOnWay: '🚨 The appropriate emergency response team has been notified and assistance is on the way.',
        ambulanceAssigned: (contact, id) => `🚑 An ambulance has been assigned to your location. Contact: ${contact}, ID: ${id}.`,
        errorFetching: '⚠️ Error fetching your emergency details. Please try again.',
        emergencyStatus: (problem, status) => `📋 Your emergency report "${problem}" is currently: ${getStatusEmoji(status)} ${status.toUpperCase()}`,
        statusUpdate: (problem, status) => `⚠️ Update: Your emergency report "${problem}" is now: ${getStatusEmoji(status)} ${status.toUpperCase()}`,
        help: `ℹ️ Emergency Bot Help:
        
• /start - Start using the emergency bot
• /help - Show this help message
• /language - Change your language
• /types - View types of emergencies we handle
• Send your location to report an emergency
• Send a voice message describing your emergency
• Use "Check Emergency Status" to get updates`,
        languageOptions: 'Please select your preferred language:',
        languageSet: '✅ Your language has been set to English.',
        emergencyTypes: `🚨 Types of emergencies we handle:

• Medical - Health emergencies, injuries
• Fire - Building fires, wildfires
• Police - Crime, security threats
• Disaster - Natural disasters, floods, earthquakes
• Infrastructure - Power outages, gas leaks, water issues
• Traffic - Road accidents, blockages
• Other - Any other emergency situations

Just describe your emergency after sharing your location.`
    },
    es: {
        welcome: (name) => `👋 ¡Hola, ${name}! Bienvenido al Bot de Asistencia de Emergencias.\n\nPuedes usar este servicio para reportar cualquier tipo de emergencia incluyendo:\n- Emergencias médicas\n- Incendios\n- Amenazas de seguridad\n- Desastres naturales\n- Fallas de servicios públicos\n- Accidentes de tráfico\n\nPor favor comparte tu ubicación para que podamos asistirte.`,
        locationReceived: '✅ ¡Ubicación recibida! Ahora, por favor envía un mensaje de voz describiendo tu situación de emergencia en detalle.',
        shareLocationFirst: '❗ Por favor comparte tu ubicación primero para que podamos enviar la ayuda adecuada a tu ubicación.',
        processingError: '⚠️ Lo sentimos, hubo un error al procesar tu solicitud. Por favor intenta de nuevo o llama directamente a servicios de emergencia si es urgente.',
        voiceReceived: '🎤 ¡Mensaje de voz recibido! Nuestro equipo de respuesta a emergencias está revisando tu situación.',
        errorReporting: '❌ Error al reportar la emergencia. Por favor intenta de nuevo o llama directamente a servicios de emergencia.',
        noActiveEmergencies: 'ℹ️ No tienes informes de emergencia activos en este momento.',
        errorFetching: '⚠️ Error al obtener los detalles de tu emergencia. Por favor intenta de nuevo.',
        responseOnWay: '🚨 El equipo de respuesta a emergencias apropiado ha sido notificado y la asistencia está en camino.',
        emergencyStatus: (problem, status) => `📋 Tu informe de emergencia "${problem}" está actualmente: ${getStatusEmoji(status)} ${getStatusInSpanish(status)}`,
        statusUpdate: (problem, status) => `⚠️ Actualización: Tu informe de emergencia "${problem}" ahora está: ${getStatusEmoji(status)} ${getStatusInSpanish(status)}`,
        help: `ℹ️ Ayuda del Bot de Emergencia:
        
• /start - Comenzar a usar el bot de emergencia
• /help - Mostrar este mensaje de ayuda
• /language - Cambiar tu idioma
• /types - Ver tipos de emergencias que manejamos
• Envía tu ubicación para reportar una emergencia
• Envía un mensaje de voz describiendo tu emergencia
• Usa "Verificar Estado de Emergencia" para obtener actualizaciones`,
        responseOnWay: '🚨 El equipo de respuesta a emergencias apropiado ha sido notificado y la asistencia está en camino.',
        languageOptions: 'Por favor selecciona tu idioma preferido:',
        languageSet: '✅ Tu idioma ha sido configurado a Español.',
        emergencyTypes: `🚨 Tipos de emergencias que manejamos:

• Médica - Emergencias de salud, lesiones
• Incendio - Incendios de edificios, incendios forestales
• Policía - Crimen, amenazas de seguridad
• Desastre - Desastres naturales, inundaciones, terremotos
• Infraestructura - Cortes de energía, fugas de gas, problemas de agua
• Tráfico - Accidentes viales, bloqueos
• Otros - Cualquier otra situación de emergencia

Solo describe tu emergencia después de compartir tu ubicación.`
    }
};

// Helper functions for status display
function getStatusEmoji(status) {
    switch (status.toLowerCase()) {
        case 'pending': return '⏳';
        case 'dispatched': return '🚨';
        case 'in progress': return '🔄';
        case 'resolved': return '✅';
        default: return '📋';
    }
}

function getStatusInSpanish(status) {
    switch (status.toLowerCase()) {
        case 'pending': return 'PENDIENTE';
        case 'dispatched': return 'DESPACHADO';
        case 'in progress': return 'EN PROGRESO';
        case 'resolved': return 'RESUELTO';
        default: return status.toUpperCase();
    }
}

// Function to get user's language
const getUserLanguage = (chatId) => {
    return userLanguages.get(chatId) || 'en'; // Default to English
};

// Function to get message in user's language
const getMessage = (chatId, messageKey, ...args) => {
    const lang = getUserLanguage(chatId);
    if (typeof messages[lang][messageKey] === 'function') {
        return messages[lang][messageKey](...args);
    }
    return messages[lang][messageKey] || messages['en'][messageKey]; // Fallback to English
};

// Function to send a welcome message with menu buttons
const sendWelcomeMessage = (chatId, userName) => {
    const welcomeMessage = getMessage(chatId, 'welcome', userName);

    const lang = getUserLanguage(chatId);
    const buttonText = lang === 'es' ? 'Enviar Ubicación' : 'Send Location';
    const statusText = lang === 'es' ? 'Verificar Estado de Emergencia' : 'Check Emergency Status';
    const typesText = lang === 'es' ? 'Tipos de Emergencia' : 'Emergency Types';
    const languageText = lang === 'es' ? 'Cambiar Idioma' : 'Change Language';

    const options = {
        reply_markup: {
            keyboard: [
                [{ text: `📍 ${buttonText}`, request_location: true }],
                [{ text: `🔄 ${statusText}` }, { text: `🚨 ${typesText}` }],
                [{ text: `🌐 ${languageText}` }]
            ],
            resize_keyboard: true
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
};

// Function to ask for a voice message
const askForVoiceMessage = (chatId) => {
    bot.sendMessage(chatId, getMessage(chatId, 'locationReceived'));
};

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'User';
    sendWelcomeMessage(chatId, userName);
});

// Language command
bot.onText(/\/language/, (msg) => {
    showLanguageOptions(msg.chat.id);
});

// Types command
bot.onText(/\/types/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, getMessage(chatId, 'emergencyTypes'));
});

// Function to show language options
function showLanguageOptions(chatId) {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🇺🇸 English', callback_data: 'lang_en' },
                    { text: '🇪🇸 Español', callback_data: 'lang_es' }
                ]
            ]
        }
    };
    
    bot.sendMessage(chatId, getMessage(chatId, 'languageOptions'), options);
}

// Handle callback queries (for language selection)
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    if (data.startsWith('lang_')) {
        const lang = data.split('_')[1];
        userLanguages.set(chatId, lang);
        
        bot.answerCallbackQuery(callbackQuery.id);
        bot.sendMessage(chatId, getMessage(chatId, 'languageSet'));
        
        // Re-send welcome message with updated language
        const userName = callbackQuery.from.first_name || 'User';
        sendWelcomeMessage(chatId, userName);
    }
});

// Handling location sharing
bot.on('location', async (msg) => {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;

    userLocations.set(chatId, { latitude, longitude });

    console.log(`📍 Received location: Latitude ${latitude}, Longitude ${longitude}`);
    askForVoiceMessage(chatId);
});

// Handling voice messages
bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;

    if (!userLocations.has(chatId)) {
        bot.sendMessage(chatId, getMessage(chatId, 'shareLocationFirst'));
        return;
    }

    // First, immediately acknowledge receipt
    bot.sendMessage(chatId, getMessage(chatId, 'voiceReceived'));

    // Show "typing" indicator to indicate the bot is processing
    bot.sendChatAction(chatId, 'typing');

    const { latitude, longitude } = userLocations.get(chatId);
    const fileId = msg.voice.file_id;

    try {
        const file = await bot.getFile(fileId);
        const filePath = file.file_path;

        const url = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const text = await stt(url);
        const emergencyData = await handleEmergency(text, latitude, longitude);
        if (emergencyData.ambulance) {
            const ambulance = await assignAmbulance(emergencyData._id);
            if (ambulance) {
                bot.sendMessage(chatId, getMessage(chatId, 'ambulanceAssigned', ambulance.contact, ambulance.id));
            } else {
                bot.sendMessage(chatId, '⚠️ Sorry, no ambulances are currently available. We will update you when an ambulance becomes available. Please stay safe and wait for further updates.');
            }
        }

        if (!emergencyData || !emergencyData._id) {
            bot.sendMessage(chatId, getMessage(chatId, 'errorReporting'));
            return;
        }

        userEmergencies.set(chatId, emergencyData._id);
        previousStatuses.set(emergencyData._id.toString(), emergencyData.status); // Store initial status

        // Provide feedback on the recognized emergency
        const statusMessage = getMessage(chatId, 'emergencyStatus', emergencyData.problem, emergencyData.status);
        bot.sendMessage(chatId, statusMessage);
    } catch (error) {
        console.error('❌ Error handling voice note:', error);
        bot.sendMessage(chatId, getMessage(chatId, 'processingError'));
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

            if (oldStatus && oldStatus !== newStatus) {
                // Status changed, notify user
                const chatId = [...userEmergencies.entries()].find(([_, id]) => id.equals(emergency._id))?.[0];

                if (chatId) {
                    const updateMessage = getMessage(chatId, 'statusUpdate', emergency.problem, newStatus);
                    bot.sendMessage(chatId, updateMessage);
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

// Handle all text messages
bot.on('message', async (msg) => {
    if (!msg.text) return; // Skip non-text messages
    
    const chatId = msg.chat.id;
    const lang = getUserLanguage(chatId);
    
    // Check for language button click
    if (msg.text === '🌐 Change Language' || msg.text === '🌐 Cambiar Idioma') {
        showLanguageOptions(chatId);
        return;
    }
    
    // Check for emergency types button click
    if (msg.text === '🚨 Emergency Types' || msg.text === '🚨 Tipos de Emergencia') {
        bot.sendMessage(chatId, getMessage(chatId, 'emergencyTypes'));
        return;
    }
    
    // Check for status button click
    if (msg.text === '🔄 Check Emergency Status' || msg.text === '🔄 Verificar Estado de Emergencia') {
        if (!userEmergencies.has(chatId)) {
            bot.sendMessage(chatId, getMessage(chatId, 'noActiveEmergencies'));
            return;
        }

        const emergencyId = userEmergencies.get(chatId);
        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            bot.sendMessage(chatId, getMessage(chatId, 'errorFetching'));
            return;
        }

        const statusMessage = getMessage(chatId, 'emergencyStatus', emergency.problem, emergency.status);
        bot.sendMessage(chatId, statusMessage);
    }
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, getMessage(chatId, 'help'));
});

// Run status check in the background
setInterval(checkForStatusUpdates, 5000);
console.log('🚨 Emergency Assistance Bot is running!');