"use strict";
const fs = require("fs");
const moment = require("moment-mini");

class Puppeteer365OnlineService {

    constructor(puppeteer, puppeteerOptions, exportPath, screenshotPath){
        this.puppeteer = puppeteer;
        this.puppeteerOptions = puppeteerOptions;
        this.screenshotPath = screenshotPath;
        this.exportPath = exportPath;        

        this.debug = screenshotPath !== undefined;
        this.boiUrl = "https://www.365online.com";
    }

    async init(){
        console.log('Launching browser');
        this._browser = await this.puppeteer.launch(this.puppeteerOptions);        
        this._page = await this._browser.newPage();
    }

    async page(){
        if(!this._page) {
            await this.init();
        }
        return this._page;        
    }

    async closeBrowser(){
        if(!this._browser){
            console.log('Browser not initialised - nothing to do');
        }
        else {
            console.log('Closing browser');
            await this._browser.close();
        }
    }

    async login(id, num, dob, pin) {
        const p = await this.page();
        await p.goto(this.boiUrl);
        await this.acceptCookies();
        await this.completeLoginStep1(id, num, dob);
        await this.completeLoginStep2(pin);
    }

    async downloadLatestTransactions() {
    
        await this.downloadTransactions(undefined, undefined);
    }

    async downloadTransactions(from, to) {

        await this.navigateToStatements();
        if(from && to){
            await this.narrowTransactionSearch(from, to);
        }
        await this.exportTransactionsCSVToLocalStorage();
    }

    async acceptCookies() {
        try {
            const p = await this.page();
            // allow cookie banner to load - this blocks the entire page until accepted/rejected
            await p.waitForSelector('#onetrust-accept-btn-handler');
            await this.takeScreenshot('cookies');
            await p.click('#onetrust-accept-btn-handler');
            console.log('Cookies accepted');
            // wait for cookie banner to disappear - scrolls away slowly
            await p.waitForSelector('#onetrust-banner-sdk', {hidden: true});
            await this.takeScreenshot('cookiesAccepted');
        }
        catch(error) {
            console.log('Cookies banner not displayed');
        }
    }

    async completeLoginStep1(id, num, dob) {
        console.log(`Completing login step 1`);
        const p = await this.page();
        await p.click('#form\\3A userId');
        await p.keyboard.type(id);
        const phoneRequested = await this.populatePhoneNumber(num);        
        const dobRequested = await this.populateDOB(dob);        
        await this.takeScreenshot('login1');
        if(!phoneRequested && !dobRequested) {
            throw 'Error logging in - could not enter phone or DOB details.';
        }
        await this.clickAndWait('#form\\3A continue');
    }

    async completeLoginStep2(pin) {
        console.log(`Completing login step 2`);
        await this.populatePin(pin);
        await this.takeScreenshot('login2');
        await this.clickAndWait('#form\\3A continue');
    }

    async takeScreenshot(title) {
        if(this.debug){
            const p = await this.page();
            await p.screenshot({path: `${this.screenshotPath}/${title}.png`});
        }
    }

    async clickAndWait(selector) {
        const p = await this.page();
        await Promise.all([
            p.waitForNavigation({ waitUntil: 'networkidle0' }),
            p.click(selector)
        ]);
    }

    async populatePhoneNumber(num) {
        try {
            const p = await this.page();
            await p.click('#form\\3A phoneNumber');
            await p.keyboard.type(num);
            return true;
        }
        catch(error) {
            console.log('Phonenumber input not found');
            return false;
        }
    }
    
    async populateDOB(dob) {
        try {
            const p = await this.page();
            await p.click('#form\\3A dateOfBirth_date');
            await p.keyboard.type(dob.d);
            await p.click('#form\\3A dateOfBirth_month');
            await p.keyboard.type(dob.m);
            await p.click('#form\\3A dateOfBirth_year');
            await p.keyboard.type(dob.y);        
            return true;
        }
        catch(error) {
            console.log('Dob inputs not found');
            return false;            
        }
    }

    async populatePin(pin) {
        for(let i=0; i<6; i++){
            await this.attemptPin(i+1, pin.charAt(i));
        }
    }

    async attemptPin(i, value) {
        try{
            const p = await this.page();
            await p.click(`#form\\3A security_number_digit${i}`);
            await p.keyboard.type(value);
            console.log(`Pin input ${i} requested`);
        }
        catch(error) {
            console.log(`Pin input ${i} not requested`);
        }
    }

    async navigateToStatements() {
        console.log(`Navigating to statements`);
        const p = await this.page();
        await p.waitForSelector('#form\\3A leftHandNavSubview\\3A statements');
        await this.clickAndWait('#form\\3A leftHandNavSubview\\3A statements');
        await p.select('#form\\3A selectAccountDropDown', '8');
        await p.waitForSelector('.export');
        await this.takeScreenshot('statements');
    }

    async narrowTransactionSearch(from, to) {
        await this.expandAdvancedTransactionSearch(page);

        console.log(`Narrowing selection`);
        const p = await this.page();
        await p.waitForSelector('#form\\3A advancedGoButton', { visible: true });
        await p.$eval('#form\\3A fromDateInputDate', (el, value) => el.value = value, from);
        // await p.$eval('#form\\3A fromDateInputCurrentDate', (el, value) => el.value = value, moment().format('MM/YYYY'));
        await p.$eval('#form\\3A toDateInputDate', (el, value) => el.value = value, to);
        // await p.$eval('#form\\3A toDateInputCurrentDate', (el, value) => el.value = el.value = value, moment().format('MM/YYYY'));
        await this.clickAndWait('#form\\3A advancedGoButton');
        await this.takeScreenshot('advancedSearch');
    }

    async expandAdvancedTransactionSearch() {
        console.log('Expanding search');
        const p = await this.page();
        await p.click('#form\\3A advancedSearchButton');
        await p.waitForTimeout(3000);    
    }

    async exportTransactionsCSVToLocalStorage() {
        console.log(`Downloading transactions to ${this.exportPath}`);
        const p = await this.page();
        await p._client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: this.exportPath,
        });

        await Promise.all([
            p.waitForResponse(r => {
                return r.url().indexOf('statements?exeution=') != 0;
            }),
            p.click('.export')
        ]);    
    }
}

module.exports = Puppeteer365OnlineService;