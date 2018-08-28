const mongoose = require('mongoose');
const {promisify} = require('util');
const redis = require('redis');
const {redisUrl} = require('../config/keys');
const client = redis.createClient(redisUrl);
client.hget = promisify(client.hget);


const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function() {
    if(!this.useCache){
        return exec.apply(this,arguments);
    }
    const query = this.getQuery();
    const collection = this.mongooseCollection.name;
    let key = JSON.stringify({...query, collection});
    let cacheValue = await client.hget(this.hashKey, key);
    if(cacheValue){
        const doc = JSON.parse(cacheValue)
        return Array.isArray(doc)
         ? doc.map(d=> new this.model(d))
         : this.model(doc)
    }else{
         let queryResult = await exec.apply(this,arguments);
         client.hset(this.hashKey,key, JSON.stringify(queryResult));
         return queryResult;
    }
   
}

module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey));
    }
}