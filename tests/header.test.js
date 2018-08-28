const Page = require('./helpers/page');
//const Page = require('puppeteer/lib/Page');
let page;



// Page.prototype.login = async function(session,sig){
//     await this.setCookie({name:'session', value: session});
//     await this.setCookie({name:'session.sig', value:sig});
//     await this.goto('localhost:3000');
// }


beforeEach(async ()=>{
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach(async()=>{
    await page.close();
})

test('header has correct text', async ()=>{

    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');

})
test('clicking login starts oauth flow', async()=>{
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})
test('logout button appears when logged in', async()=>{
    // STEP 1 : GENERATE SESSIONSTRING FROM USER ID
    // await page.login(session,sig);
    await page.login();
    const text = await page.getContent('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');
})
