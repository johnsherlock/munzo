const puppeteer = require('puppeteer');
const puppeteerLoginService = require('./services/Puppeteer365OnlineService');
// Get the creds from the JSON file 
let { id, num, dob, pin } = require("../resources/creds.json"); 

(async () => {
    console.time("timer");
    console.log(`Opening browser`);
    const browser = await puppeteer.launch({
        dumpio: false,
        ignoreHTTPSErrors: false,
        headless: true
    });
    const page = await browser.newPage();
    
    puppeteerLoginService.enableDebug('./debug')

    await puppeteerLoginService.login(page, id, num, dob, pin);

    await puppeteerLoginService.downloadLatestTransactions(page, './export');

    console.log('Closing browser');
    await browser.close();

    console.log('Done!');
    console.timeEnd("timer");
})()