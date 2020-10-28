"use-strict";

const fs = require('fs');
const chromeLambda = require("chrome-aws-lambda");
const AWS = require('aws-sdk');
const Puppeteer365OnlineService = require('../services/Puppeteer365OnlineService');
const TransactionParser = require('../services/TransactionParser');
const TelegramService = require('../services/TelegramService');
const TransactionService = require('../services/TransactionService');
const S3Service = require('../services/S3Service');
    
exports.handler = async function(event) {

    console.log(`Making dir: ${fs.mkdirSync('/tmp/debug')}`);
    console.log(`Making dir: ${fs.mkdirSync('/tmp/export')}`);
    await downloadTransactions();
    
    const s3s = new S3Service();
    await s3s.uploadAllFilesToS3('/tmp/debug', 'munzo');
    await s3s.uploadAllFilesToS3('/tmp/export', 'munzo');
    
    const telegramService = new TelegramService();
    const transactionParser = new TransactionParser('/tmp/export/TransactionExport.csv');
    const transactionService = new TransactionService(telegramService, transactionParser);
    await transactionService.sendDailySummary();

    console.log('Done!');
}

const downloadTransactions = async () => {

    const { id, num, dob, pin } = await retrieveCredentials();

    const puppeteerOptions = {
        args: chromeLambda.args,
        executablePath: await chromeLambda.executablePath,
        dumpio: false,
        ignoreHTTPSErrors: false,
        headless: true
    };
    
    const puppeteer365Service = new Puppeteer365OnlineService(chromeLambda.puppeteer, puppeteerOptions, '/tmp/export', '/tmp/debug');
    
    await puppeteer365Service.login(id, num, dob, pin);
    await puppeteer365Service.downloadLatestTransactions();
    await puppeteer365Service.closeBrowser();    
}

const retrieveCredentials = async () => {
    const ssm = new AWS.SSM({ region: process.env.AWS_DEFAULT_REGION });
    const credentials = await ssm.getParameter({
        Name: 'munzoCredentials',
        WithDecryption: true
    }).promise();
    return JSON.parse(credentials.Parameter.Value);
}