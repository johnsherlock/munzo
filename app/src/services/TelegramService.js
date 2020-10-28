"use strict";

const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
    
    constructor(polling = false) {
        this.chatId = 1328807326;
        this.bot = new TelegramBot('1387534484:AAE-_UA4rIsQGAkHvPdDSoY6-N220gCqHc8', { polling });
    }

    async sendMessage(msg) {
        console.log(`Sending message to chat ${this.chatId}`);
        try {
            await this.bot.sendMessage(this.chatId, msg, { parse_mode: 'HTML' });
        } catch(error) {
            console.log(`Error sending message ${error}`);
        }
    }    
}
module.exports = TelegramService;