const puppeteer = require('puppeteer');
const FormData = require('form-data');

const beginSessionUrl = "https://www.365online.com";
const beginLoginUrl = "https://www.365online.com/online365/spring/authentication?execution=e1s1";
const continueLoginUrl = "https://www.365online.com/online365/spring/authentication?execution=e1s2";

exports.login = async (id, num, dob, pin) => {

    console.log(`Opening browser`);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(beginSessionUrl);
    
    console.log(`Completing login step 1`);
    await page.click('#form\\3A userId');
    await page.keyboard.type(id);

    await populatePhoneNumber(page, num);
    await populateDOB(page, dob);
    await clickAndWait('#form\\3A continue', page);

    console.log(`Completing login step 2`);
    await populatePin(page, pin);
    await clickAndWait('#form\\3A continue', page);

    console.log(`Taking screen shot`);
    await page.screenshot({ path: 'login.png' });

    return { browser: browser, page: page }
};

exports.downloadLatestTransactions = async (page) => {
    
    console.log(`Navigating to statements`);
    await clickAndWait('#form\\3A leftHandNavSubview\\3A statements', page);
    await page.select('#form\\3A selectAccountDropDown', '8');
    await page.waitForSelector('.export');

    await clickAndWait('.export', page);

    const result = await page.evaluate(async () => {
        const form = document.querySelector('form[name="form"]');
        const data = new FormData(form);
    
        data.append('btConfirmer', 'Confirmer');
        data.append('form:selectAccountDropDown', '8');
        data.append('form:selectPeriodDropdown', '-1');
        data.append('form:fromDateInputDate', '03/09/2020');
        data.append('form:fromDateInputCurrentDate', '10/2019');
        data.append('form:toDateInputDate', '02/10/2020');
        data.append('form:toDateInputCurrentDate', '10/2020');
        data.append('form:selectedTransactionType', 'ALL');
    
        try{
            return fetch(form.action, {
            method: 'POST',
            credentials: 'include',
            body: data,
            })
            .then(response => response.text());
        } 
        catch (error) {
            console.log(`Error downloading transactions: ${error}`);
            return '';
        }
    });
    console.log(`Transactions: ${transactions}`);
}

const clickAndWait = async (selector, page) => {
    await Promise.all([
        page.waitForNavigation(),
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
    }
    catch(error) {
        console.log(`Pin input ${i} not requested`);
    }
}