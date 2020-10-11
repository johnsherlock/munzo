const boiUrl = "https://www.365online.com";

const debug = false;
const screenshotPath = undefined;

const enableDebug = (screenshotPath) => { 
    console.log('Debug enabled');
    this.debug = true;
    this.screenshotPath = screenshotPath;
}

const login = async (page, id, num, dob, pin) => {

    await page.goto(boiUrl);
    
    await acceptCookies(page);
    await completeLoginStep1(page, id, num, dob);
    await completeLoginStep2(page, pin);
};

const downloadLatestTransactions = async (page, path) => {
    
    await downloadTransactions(page, path, undefined, undefined);
}

const downloadTransactions = async (page, path, from, to) => {

    await navigateToStatements(page);
    if(from && to){
        await narrowTransactionSearch(page, from, to);
    }
    await exportTransactionsCSVToLocalStorage(page, path);
}

const acceptCookies = async (page) => {
    try {
        await page.waitForTimeout(2000);
        await takeScreenshot(page, 'cookies');
        await page.click('#onetrust-accept-btn-handler');
        console.log('Cookies accepted');
        await page.waitForTimeout(1000);
    }
    catch(error) {
        console.log('Cookies banner not displayed');
    }
}

const completeLoginStep1 = async (page, id, num, dob) => {
    console.log(`Completing login step 1`);
    await page.click('#form\\3A userId');
    await page.keyboard.type(id);

    await populatePhoneNumber(page, num);
    await populateDOB(page, dob);
    await takeScreenshot(page, 'login1');
    await clickAndWait('#form\\3A continue', page);
}

const completeLoginStep2 = async (page, pin) => {
    console.log(`Completing login step 2`);
    await populatePin(page, pin);
    await takeScreenshot(page, 'login2');
    await clickAndWait('#form\\3A continue', page);
}

const takeScreenshot = async (page, title) => {
    if(this.debug){
        await page.screenshot({path: `${this.screenshotPath}/${title}.png`});
    }
}

const clickAndWait = async (selector, page) => {
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click(selector)
    ]);
}

const populatePhoneNumber = async (page, num)  => {
    try {
        await page.click('#form\\3A phoneNumber');
        await page.keyboard.type(num);
    }
    catch(error) {
        console.log('Phonenumber input not found');
    }
}

const populateDOB = async (page, dob)  => {
    try {
        await page.click('#form\\3A dateOfBirth_date');
        await page.keyboard.type(dob.d);
        await page.click('#form\\3A dateOfBirth_month');
        await page.keyboard.type(dob.m);
        await page.click('#form\\3A dateOfBirth_year');
        await page.keyboard.type(dob.y);
    }
    catch(error) {
        console.log('Dob inputs not found');
    }
}

const populatePin = async (page, pin) => {
    for(i=0; i<6; i++){
        await attemptPin(page, i+1, pin.charAt(i));
    }
}

const attemptPin = async (page, i, value) => {
    try{
        await page.click(`#form\\3A security_number_digit${i}`);
        await page.keyboard.type(value);
        console.log(`Pin input ${i} requested`);
    }
    catch(error) {
        console.log(`Pin input ${i} not requested`);
    }
}

const navigateToStatements = async (page) => {
    console.log(`Navigating to statements`);
    await clickAndWait('#form\\3A leftHandNavSubview\\3A statements', page);
    await page.select('#form\\3A selectAccountDropDown', '8');
    await page.waitForSelector('.export');
    await takeScreenshot(page, 'statements');
}

const narrowTransactionSearch = async (page, from, to) => {
    await expandAdvancedTransactionSearch(page);

    console.log(`Narrowing selection`);
    await page.waitForSelector('#form\\3A advancedGoButton', { visible: true });
    await page.$eval('#form\\3A fromDateInputDate', (el, value) => el.value = value, from);
    // await page.$eval('#form\\3A fromDateInputCurrentDate', (el, value) => el.value = value, moment().format('MM/YYYY'));
    await page.$eval('#form\\3A toDateInputDate', (el, value) => el.value = value, to);
    // await page.$eval('#form\\3A toDateInputCurrentDate', (el, value) => el.value = el.value = value, moment().format('MM/YYYY'));
    await clickAndWait('#form\\3A advancedGoButton', page);
    await takeScreenshot(page, 'advancedSearch');
}

const expandAdvancedTransactionSearch = async (page) => {
    console.log('Expanding search');
    await page.click('#form\\3A advancedSearchButton');
    await page.waitForTimeout(3000);    
}

const exportTransactionsCSVToLocalStorage = async (page, path) => {
    console.log(`Downloading transactions`);
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path,
    });

    await Promise.all([
        page.waitForResponse(r => {
            return r.url().indexOf('statements?exeution=') != 0;
        }),
        await page.click('.export')
    ]);
}

module.exports = { enableDebug, login, downloadTransactions, downloadLatestTransactions }