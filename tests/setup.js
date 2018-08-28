jest.setTimeout(30000);
const mongoose = require('mongoose');
const keys = require('../config/keys');

require('../models/User');
require('../models/Blog');
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });