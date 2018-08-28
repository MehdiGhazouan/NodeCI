const Page = require('./helpers/page');
const deleteBlog = require('./factories/blogFactory');
let page;

beforeEach(async()=>{
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach(async()=>{
    await page.close();
})

describe('when logged in', async()=>{
    beforeEach(async()=>{
        await page.login();
        await page.click('a.btn-floating')
    })
    test('creating a new blog form appears', async()=>{
        const label = await page.getContent('form label');
        expect(label).toEqual('Blog Title');
    })
    describe('And submitting form with valid inputs', async()=>{
        beforeEach(async()=>{
            await page.type('div.title input','My Title');
            await page.type('div.content input','My Content');
            await page.click('form button.teal');
        })
        test('takes user to review page', async()=>{
            const text = await page.getContent('form h5');
            expect(text).toEqual('Please confirm your entries');
        })
        test('submiting then saving adds blogs to index page', async()=>{
            await page.click('button.green');
            await page.waitFor('div.card');

            const title = await page.getContent('.card-title');
            const content = await page.getContent('.card-content p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
            let blogId = await page.$eval('.card-action a', el=> el.href);
            blogId = blogId.replace(/http\:\/\/localhost\:3000\/blogs\//g,'');
            await deleteBlog(blogId);
        })
    })
    describe('And submitting form with invalid inputs',async()=>{
        beforeEach(async()=>{
            await page.click('form button.teal');
        })
        test('form shows an error message ', async()=>{
            const titleError = await page.getContent('div.title div.red-text');
            const contentError = await page.getContent('div.content div.red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe.only('User is not logged in, ', async()=> {

    const actions = [{
        method: 'GET',
        path: '/api/blogs'
    }
    ,{
        method: 'POST',
        path: 'api/blogs',
        body: {
            title: 'T',
            content: 'C'
        }
    }]

    test('cannot make get request', async()=>{
        const result = await page.makeRequest(actions[0]);

        expect(result).toEqual({ error: 'You must log in!' })
    })
    test('cannot make post request', async()=>{
        const result = await page.makeRequest(actions[1]);

        expect(result).toEqual({ error: 'You must log in!' })
    })

    test('Cannot make blog requests', async()=> {
        const results = await page.execRequests(actions);

        results.forEach((result)=> {
            expect(result).toEqual({ error: 'You must log in!' })
        })
    })
})
