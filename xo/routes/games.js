const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const EventEmitter = require('events');
const ee = new EventEmitter();

let games = [];

const broadcast = (req, message) => {
    let clients = req.app.get('clients');
    let closed = [];

    clients.forEach(client => {
        try {
            client.send(JSON.stringify(message));
        } catch (e) {
            closed.push(client);
        }
    });

    clients = clients.filter(target => closed.indexOf(target) === -1);
    req.app.set('clients', clients);
};

const createClientId = () => {
    const currentDate = (new Date()).valueOf().toString();
    return crypto.createHash('sha1').update(currentDate).digest('hex');
};


router.get('/', (req, res, next) => {
    res.json(games);
});


router.post('/', (req, res, next) => {
    const gameId = req.body.gameId;
    const clientId = req.cookies.clientId || createClientId();
    const game = {
        gameId,
        clientId
    };

    if (games.some(g => g.gameId === game.gameId)) {
        res.status(409).send('Game name is already in use.');
        return;
    }

    if (games.some(g => g.clientId === game.clientId)) {
        res.status(400).send('You can\'t create more than one game.');
        return;
    }

    games.push(game);

    broadcast(req, {
        action: 'add',
        gameId
    });

    res.cookie('clientId', clientId);
    res.json(game);
});


router.delete('/', (req, res) => {
    const { gameId } = req.query;
    const { clientId } = req.cookies;

    const game = games.find(g => g.gameId === gameId);

    if (!game) {
        res.status(404).send('Game not found.');
        return;
    }

    if (game.clientId !== clientId) {
        res.status(401).send('It\'s not your game man.');
        return;
    }

    games.splice(games.indexOf(game), 1);

    broadcast(req, {
        action: 'remove',
        gameId
    });

    res.status(200).send('Game was deleted.');
});


router.post('/start', (req, res) => {
    const { gameId } = req.body;

    if (gameId) {
        res.status(400).send('No gameId provided.');
        return;
    }

    if (ee.emit(`gameStart:${gameId}`)) {

    }

});

module.exports = router;
