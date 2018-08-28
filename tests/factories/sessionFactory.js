const Buffer = require('safe-buffer').Buffer;
const keys = require('../../config/keys');
const Keygrip = require('keygrip');
const keygrip = new Keygrip([keys.cookieKey]);


module.exports = (user)=> {
    const sessionObj = {passport: {
        user: user._id.toString()
    }}
    const session = Buffer.from(JSON.stringify(sessionObj)).toString('base64');
    //Step 2 : GENERATE SESSION SIGNATURE USING KEYGRIP
    const sig = keygrip.sign('session='+session);
    return { session, sig };
}