const timeout = process.env.SLOWMO ? 30000 : 10000;

beforeAll(async () => {
    await page.goto('http://localhost:3000', {waitUntil: 'domcontentloaded'});
});

describe('Test playthrough', () => {
    test('Title of the page', async () => {
        const title = await page.title();
        expect(title).toBe('playCAH');
    }, timeout);

    test('Login first user', async () => {
        const page = await loginUser('UserA', 'Lobby1')
        expect(page.url()).toBe('http://localhost:3000/lobby/Lobby1')
    }, timeout)

    test('Login second user', async () => {
        const page = await loginUser('UserB', 'Lobby1')
        
        expect(page.url()).toBe('http://localhost:3000/lobby/Lobby1')

        const users = await page.$x("//div[@class='name']")
        expect(users.length).toBeGreaterThan(0)

        for(let user of users) {
            let name = await page.evaluate((el => el.innerText), user)
            expect(['UserA', 'UserB', 'invite']).toContain(name)
        }
    }, timeout)

    test('Login third user', async () => {
        const page = await loginUser('UserC', 'Lobby1')
        
        expect(page.url()).toBe('http://localhost:3000/lobby/Lobby1')

        const users = await page.$x("//div[@class='name']")
        expect(users.length).toBeGreaterThan(0)

        for(let user of users) {
            let name = await page.evaluate((el => el.innerText), user)
            expect(['UserA', 'UserB', 'UserC', 'invite']).toContain(name)
        }
    }, timeout)

    test('Start game', async () => {
        const pages = await browser.pages()
        const page = pages[2]
        await page.bringToFront()
        await page.click(".actions button")
        await page.waitForSelector('#game')
        await new Promise(resolve =>  setTimeout(resolve, 2000));

        expect(page.url()).toBe('http://localhost:3000/game/Lobby1')

    }, timeout)


});

async function loginUser(name, lobby) {
    const page = await browser.newPage()
    await page.goto('http://localhost:3000', {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('#home')
    await page.type('.name input', name)
    await page.type('.lobby input', lobby)
    await page.click('.join-lobby')
    await page.waitForSelector('#lobby')
    return page
}