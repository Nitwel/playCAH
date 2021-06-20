const puppeteer = require('puppeteer');

(async function main(){
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', {waitUntil: 'domcontentloaded'});

        await page.type('.name input', "Hello")
        await page.type('.lobby input', lobby)
        await page.click('.join-lobby')
        await page.waitForSelector('.start')

        const userA = await page.$('.user div.name[text=UserA]')
        console.log(userA)
        expect(userA).toBeDefined()
        
        await new Promise(resolve =>  setTimeout(resolve, 5000));
        console.log('done');
        await browser.close();
    } catch (e) {
        console.log('Err', e);
    }
})();