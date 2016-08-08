const express = require('express');
const util = require('util');

const config = require('../config');
const router = express.Router();
const dbConnection = require('../db-connection');


/**
 * Get user info
 */
router.get('/', function (req, res) {
    const id = req.query.id;

    if (!id) {
        res.status(400).send('No user-id provided.');
        return;
    }

    dbConnection
        .then(db => {
            const users = db.getCollection('users');
            const user = users.findOne({$loki: parseInt(id)});

            if (!user) {
                res.status(400).send('No user with provided id.');
                return;
            }

            res.json(user);
        });
});


/**
 * Create new user
 */
router.post('/', function (req, res) {
    req.checkBody(config.userValidators);

    const errors = req.validationErrors();

    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    dbConnection
        .then(db => {
            const users = db.getCollection('users');
            let user;

            try {
                user = users.insert(req.body);
            } catch (e) {
                res.status(400).send('User with this email already exists.');
            }

            res.json(user);
        });
});


/**
 * Update user
 */
router.put('/', function (req, res, next) {
    res.send('respond with a resource');
});


/**
 * Delete user
 */
router.delete('/', function (req, res, next) {
    res.send('respond with a resource');
});


module.exports = router;
