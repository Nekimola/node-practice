"use strict";

const jwt = require('jsonwebtoken');

const dbConnection = require('./db-connection');
const config = require('./config');


module.exports = (req, res, next) => {
    if (config.privateUrls.indexOf(req.url) === -1) {
        next();
        return;
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        res.status(401).send('Invalid token');
        return;
    }

    const userInfo = jwt.verify(token, config.tokenSecret);

    dbConnection
        .then(db => {
            const logout = db.getCollection('logout');
            const logoutInfo = logout.findOne({
                user_id: userInfo.id
            });

            if (!logoutInfo) {
                next();
                return;
            }

            if (logoutInfo.date < (new Date()).getTime()) {
                res.status(401).send('Invalid token');
                return;
            }

            next();
        });
};