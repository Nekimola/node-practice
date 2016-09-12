const mongoose = require('mongoose');

const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

const mongodbUri = 'mongodb://qwerty:123456@ds029466.mlab.com:29466/node-training';

mongoose.connect(mongodbUri, options);

const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;
