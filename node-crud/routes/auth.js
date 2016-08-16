"use strict";

const express = require('express');
const util = require('util');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passwordHash = require('password-hash');

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
            const user = users.findOne({ email });

            if (!user || !passwordHash.verify(password, user.password)) {
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
    dbConnection
        .then(db => {
            const logout = db.getCollection('logout');

            logout.insert({
                user_id: req.session.user.$loki,
                date: (new Date()).getTime()
            });

            res.send('You have successfully logged out.')
        });
});


module.exports = router;
