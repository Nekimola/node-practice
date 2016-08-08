"use strict";

const express = require('express');
const util = require('util');
const jwt = require('jsonwebtoken');
const router = express.Router();

const dbConnection = require('../db-connection');
const config = require('../config');


router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const errorMessage = 'Invalid email or password';

    if (!email || !password) {
        res.status(401).send(errorMessage);
        return;
    }

    dbConnection
        .then(db => {
            const users = db.getCollection('users');
            const user = users.findOne({ email, password });

            if (!user) {
                res.status(401).send(errorMessage);
                return;
            }

            const logout = db.getCollection('logout');
            const logoutData = logout.find({'user_id': user.$loki});
            logout.remove(logoutData);

            res.json({
                token: jwt.sign({ id: user.$loki }, config.tokenSecret)
            });
        });
});


router.post('/logout', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userInfo = jwt.verify(token, config.tokenSecret);

    dbConnection
        .then(db => {
            const logout = db.getCollection('logout');

            logout.insert({
                user_id: userInfo.id,
                date: (new Date()).getTime()
            });

            res.send('You have successfully logged out.')
        });
});


module.exports = router;
