const puppeteerLoginService = require('./PuppeteerTransactionService');
// Get the creds from the JSON file 
let { id, num, dob, pin } = require("../resources/creds.json"); 

(async () => {
    const browserSession = await puppeteerLoginService.login(id, num, dob, pin);

    await puppeteerLoginService.downloadLatestTransactions(browserSession.page);

    console.log('Closing browser');
    await browserSession.browser.close();
})()