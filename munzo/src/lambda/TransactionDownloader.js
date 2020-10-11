const chromeLambda = require("chrome-aws-lambda");
const AWS = require('aws-sdk');
const puppeteerLoginService = require('../services/Puppeteer365OnlineService');
//let { id, num, dob, pin } = require("../../resources/creds.json"); 

exports.handler = async function(event) {

    console.log(`Opening browser`);

    const { id, num, dob, pin } = await retrieveCredentials();

    console.log(`Num: ${num}`);

    const browser = await chromeLambda.puppeteer.launch({
        args: chromeLambda.args,
        executablePath: await chromeLambda.executablePath,
        dumpio: false,
        ignoreHTTPSErrors: false,
        headless: true
    });
    const page = await browser.newPage();
    
    puppeteerLoginService.enableDebug('/tmp', true)
    await puppeteerLoginService.login(page, id, num, dob, pin);
    await puppeteerLoginService.downloadLatestTransactions(page, '/tmp');

    console.log('Closing browser');
    await browser.close();

    console.log('Done!');
}

const retrieveCredentials = async () => {
    const ssm = new AWS.SSM({ region: process.env.AWS_DEFAULT_REGION });
    const credentials = await ssm.getParameter({
        Name: 'munzoCredentials',
        WithDecryption: true
    }).promise();
    return JSON.parse(credentials.Parameter.Value);
}