const {clearHash} = require('../services/cache');



module.exports = async (req,res,next)=> {
    await next();
    console.log('cleared user cache');
    clearHash(req.user.id);
}