"use strict";

const puppeteer = require('puppeteer');
const Puppeteer365OnlineService = require('./services/Puppeteer365OnlineService');
const TransactionParser = require('./services/TransactionParser');
const TelegramService = require('./services/TelegramService');
const TransactionService = require('./services/TransactionService');
const S3Service = require('./services/S3Service');

// Get the creds from the JSON file 
let { id, num, dob, pin } = require("../resources/creds.json"); 

const puppeteerOptions = {
    dumpio: false,
    ignoreHTTPSErrors: false,
    headless: true
};

const puppeteer365Service = new Puppeteer365OnlineService(puppeteer, puppeteerOptions, './export', './debug');

const downloadTransactions = async () => {
    console.time("timer");

    await puppeteer365Service.login(id, num, dob, pin);
    await puppeteer365Service.downloadLatestTransactions();

    console.log('Done!');
    console.timeEnd("timer");
}

(async () => {
    // await downloadTransactions();
    // await puppeteer365Service.closeBrowser();    

    // const s3s = new S3Service();
    // s3s.uploadAllFilesToS3('./debug', 'munzo');
    // s3s.uploadAllFilesToS3('./export', 'munzo');
    const telegramService = new TelegramService();
    const transactionParser = new TransactionParser('./export/TransactionExport.csv');
    const transactionService = new TransactionService(telegramService, transactionParser);
    transactionService.sendDailySummary();
})()