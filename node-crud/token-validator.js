"use strict";

const jwt = require('jsonwebtoken');
const url = require('url');

const dbConnection = require('./db-connection');
const config = require('./config');


module.exports = (req, res, next) => {
    dbConnection
        .then(db => {
            const { pathname } = url.parse(req.url);

            if (config.privateUrls.indexOf(pathname) === -1) {
                next();
                return;
            }

            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

            if (!token) {
                res.status(401).send('Invalid token');
                return;
            }

            const userInfo = jwt.verify(token, config.tokenSecret);

            if (!userInfo.id) {
                res.status(401).send('Invalid token');
                return;
            }

            const logout = db.getCollection('logout');
            const users = db.getCollection('users');
            const user  = users.findOne({ $loki: userInfo.id });
            const logoutInfo = logout.findOne({ user_id: userInfo.id });

            if (logoutInfo && logoutInfo.date < (new Date()).getTime()) {
                res.status(401).send('Invalid token');
                return;
            }

            req.session = { user };
            next();
        });
};