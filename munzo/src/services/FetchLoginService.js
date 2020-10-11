const fetch = require('node-fetch');
const FormData = require('form-data')
const https = require('https');
const _ = require('lodash');

const beginSessionUrl = "https://www.365online.com/online365/spring/authentication?secureBanking=start";
const beginLoginUrl = "https://www.365online.com/online365/spring/authentication?execution=e1s1";
const continueLoginUrl = "https://www.365online.com/online365/spring/authentication?execution=e1s2";

exports.beginLogin = async (id, num, dob, pin) => {

    try{
        const httpsAgent = new https.Agent({
            keepAlive: true
        });

        const requestOptions = getRequestOptionsWithAgent(httpsAgent);

        const beginSessionResponse = await fetch(beginSessionUrl, requestOptions); 
        console.log(beginSessionResponse.headers.raw()['set-cookie']);

        const cookie = parseCookies(beginSessionResponse);
        requestOptions.headers.Cookie = parseCookies(beginSessionResponse);
        
        console.log(`Begin session headers: ${JSON.stringify(requestOptions.headers)}`)
        
        const loginPageResponse = await fetch(beginLoginUrl, requestOptions); 
        console.log(loginPageResponse.headers.raw()['set-cookie']);

        const form = getLoginStep1Form(id, num, dob);        
        const updatedCookie = getUpdatedCookie(cookie, loginPageResponse)
        const loginRequestOptions = getRequestOptionsForLoginStep1(form, updatedCookie, httpsAgent)        
        await fetch(beginLoginUrl, loginRequestOptions);

        return updatedCookie;
    }
    catch(error){
        console.log(`Error logging in - ${JSON.stringify(error)}`);
    }
}

exports.continueLogin = async (cookie, pin) => {

    try{
        const httpsAgent = new https.Agent({
            keepAlive: true
        });

        const form = getLoginStep2Form(pin);        
        const requestOptions = getRequestOptionsForLoginStep2(form, cookie, httpsAgent)        
        const continueLoginResponse = await fetch(continueLoginUrl, requestOptions);

        console.log(`Step 2 complete`);
    }
    catch(error){
        console.log(`Error logging in - ${JSON.stringify(error)}`);
    }
}

const parseCookies = (response) => {
    const raw = response.headers.raw()['set-cookie'];
    return raw.map((entry) => {
      const parts = entry.split(';');
      const cookiePart = parts[0];
      return cookiePart;
    }).join(';');
  }

const getRequestOptionsWithAgent = (httpsAgent) => {
    return {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36'
        },
        agent: httpsAgent
    };
}
const getLoginStep1Form = (id, num, dob) => {
    const form = new FormData();
    form.append('form:userId', id);
    form.append('form:phoneNumber', num);
    form.append('form:dateOfBirth_date', dob.d);
    form.append('form:dateOfBirth_month', dob.m);
    form.append('form:dateOfBirth_year', dob.y);
    form.append('javax.faces.ViewState', 'e1s1');
    form.append('form:continue', 'form:continue');
    form.append('form', 'form');
    form.append('autoScroll', '');
    form.append('form:ajaxRequestStatus', 'AJAX REQUEST PROCESSOR INACTIVE');
    return form;
}

const getLoginStep2Form = (pin) => {
    const form = new FormData();
    form.append('form:security_number_digit1', pin[0]);
    form.append('form:security_number_digit2', pin[1]);
    form.append('form:security_number_digit3', pin[2]);
    form.append('form:security_number_digit4', pin[3]);
    form.append('form:security_number_digit5', pin[4]);
    form.append('form:security_number_digit6', pin[5]);
    form.append('javax.faces.ViewState', 'e1s1');
    form.append('form:continue', 'form:continue');
    form.append('form', 'form');
    form.append('autoScroll', '');
    form.append('form:ajaxRequestStatus', 'AJAX REQUEST PROCESSOR INACTIVE');
    return form;
}

const getUpdatedCookie = (cookie, loginPageResponse) => {
    return [cookie, parseCookies(loginPageResponse)].join(',');
}

const getRequestOptionsForLoginStep1 = (form, updatedCookie, httpsAgent) => {
    return {
        method: 'POST',
        body: form,
        headers: {
            'Cookie': updatedCookie,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Referer': 'https://www.365online.com/online365/spring/authentication?execution=e1s1',
            'Upgrade-Insecure-Requests': '1',
            'Origin': 'https://www.365online.com',
            'Host': 'www.365online.com',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36'
        },
        agent: httpsAgent
    };
}

const getRequestOptionsForLoginStep2 = (form, updatedCookie, httpsAgent) => {
    return {
        method: 'POST',
        body: form,
        headers: {
            'Cookie': updatedCookie,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Referer': 'https://www.365online.com/online365/spring/authentication?execution=e1s2',
            'Upgrade-Insecure-Requests': '1',
            'Origin': 'https://www.365online.com',
            'Host': 'www.365online.com',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36'
        },
        agent: httpsAgent
    };
}