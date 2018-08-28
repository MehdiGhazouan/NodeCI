const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class Page {
    static async build(){
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page    = await browser.newPage();
        const customPage = new Page(page,browser);
        const myProxy = new Proxy(customPage, {
            get: function(target,property){
                return customPage[property] || browser[property] || page[property]
            }
        })
        return myProxy;
    }
    constructor(page,browser){
        this.page = page;
        this.browser = browser;
    }
    async login(){
        const user = await userFactory.createUser();
        this.user = user;
        const {session,sig} = sessionFactory(user);
        await this.page.setCookie({name: 'session.sig', value: sig});
        await this.page.setCookie({name: 'session', value: session});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }
    async close(){
        if(this.user){
            await userFactory.deleteUser(this.user._id);
        }
        await this.browser.close();
    }
    getContent(content){
       return this.page.$eval(content, el => el.innerHTML);
    }
    makeRequest({ method,path,body }){
        return this.page.evaluate((_method, _path, _body) => {
            return fetch(_path, {
                method: _method,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: _body
            }).then(res => res.json())
        }, method, path, body)
    }
    execRequests(actions){
        return Promise.all(
            actions.map((action)=> {    
                return this.makeRequest(action)
            })
        )
    }
}

module.exports = Page;