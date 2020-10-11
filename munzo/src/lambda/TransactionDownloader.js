const chromeLambda = require("chrome-aws-lambda");
const S3Client = require("aws-sdk/clients/s3");
const puppeteerLoginService = require('../services/Puppeteer365OnlineService');
let { id, num, dob, pin } = require("../../resources/creds.json"); 

const s3 = new S3Client({ region: 'eu-west-1' });

exports.handler = async function(event) {

    console.log(`Opening browser`);
    const browser = await chromeLambda.puppeteer.launch({
        args: chromeLambda.args,
        executablePath: await chromeLambda.executablePath,
        dumpio: false,
        ignoreHTTPSErrors: false,
        headless: true
    });
    const page = await browser.newPage();
    
    puppeteerLoginService.enableDebug('./tmp')
    await puppeteerLoginService.login(page, id, num, dob, pin);
    await puppeteerLoginService.downloadLatestTransactions(page, '/tmp');

    console.log('Closing browser');
    await browser.close();

    console.log('Done!');
}