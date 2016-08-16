const express = require('express');
const util = require('util');
const passwordHash = require('password-hash');

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
            const user = users.findOne({ $loki: parseInt(id) });

            if (!user) {
                res.status(400).send('No user with provided id.');
                return;
            }

            delete user.password;
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
                req.body.password = passwordHash.generate(req.body.password.toString());
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
router.put('/', function (req, res) {
    req.checkBody(config.userValidators);

    const errors = req.validationErrors();

    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    const id = req.body.id;

    dbConnection
        .then(db => {
            const { role, $loki } = req.session.user;
            const users = db.getCollection('users');
            const user = users.findOne({ $loki: parseInt(id) });

            if (!user) {
                res.status(400).send('No user with provided id.');
                return;
            }

            if (role === 'operator' && (req.body.role === 'admin' || user.role === 'admin')) {
                res.status(400).send('No access.');
                return;
            }

            if (role === 'user' && ($loki !== user.$loki || req.body.role !== 'user')) {
                res.status(400).send('No access.');
                return;
            }

            delete req.body.id;
            delete req.body.password;
            delete req.body.email;

            Object.assign(user, req.body);
            users.update(user);

            res.json('User was updated.');
        });
});


/**
 * Delete user
 */
router.delete('/', function (req, res) {
    const { role, $loki} = req.session.user;
    const { id } = req.query;

    if (role === 'user' && $loki !== id) {
        res.status(400).send('No access.');
        return;
    }

    dbConnection
        .then(db => {
            const users = db.getCollection('users');
            const user = users.findOne({ $loki: parseInt(id) });

            if (!user) {
                res.status(400).send('No user.');
                return;
            }

            if (role === 'operator' && user.role === 'admin') {
                res.status(400).send('No access.');
                return;
            }

            users.remove(user);
            res.send('User has been removed.');
        });
});


module.exports = router;
