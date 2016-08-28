const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const EventEmitter = require('events');

class Game extends EventEmitter {
    constructor (options) {
        super();
        Object.assign(this, options);
    }
}

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


/**
 * Get games list
 */
router.get('/', (req, res, next) => {
    res.json(games.map(game => {
        return {
            gameId  : game.gameId,
            hostId  : game.hostId,
            clientId: game.clientId,
            status  : game.status
        };
    }));
});


/**
 * Create new game
 */
router.post('/', (req, res, next) => {
    const gameId = req.body.gameId;
    const hostId = req.cookies.clientId || createClientId();

    if (!gameId) {
        res.status(400).send('No gameId provided.');
        return;
    }

    const game = new Game({
        gameId,
        hostId,
        status: 'new',
        clientId: null,
        clientRes: null
    });

    if (games.some(g => g.gameId === game.gameId)) {
        res.status(409).send('Game name is already in use.');
        return;
    }

    if (games.some(g => g.hostId === hostId)) {
        res.status(400).send('You can\'t create more than one game.');
        return;
    }

    games.push(game);

    broadcast(req, {
        action: 'add',
        gameId,
        hostId
    });

    game.on('start', () => {
        console.log('Someone started');
        broadcast(req, {
            action: 'start',
            gameId,
            hostId
        });
    });

    res.cookie('clientId', hostId);
    res.json({
        gameId,
        hostId
    });
});


/**
 * Delete game
 */
router.delete('/', (req, res) => {
    const { gameId } = req.query;
    const { clientId } = req.cookies;

    const game = games.find(g => g.gameId === gameId);

    if (!game) {
        res.status(404).send('Game not found.');
        return;
    }

    if (game.hostId !== clientId) {
        res.status(401).send('It\'s not your game, you can\'t delete it.');
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
    const clientId = req.cookies.clientId || createClientId();

    if (!gameId) {
        res.status(400).send('No gameId provided.');
        return;
    }

    const game = games.find(g => g.gameId === gameId);

    if (game.status === 'pending' && game.hostId !== clientId) {
        res.status(401).send('Game is waiting for host to get started.');
        return;
    }

    if (game.status === 'pending' && game.hostId === clientId) {
        game.status = 'started';
        game.clientRes.status(200).send('Game started.');
        res.status(200).send('Game started.');
        return;
    }

    if (game.status === 'new') {
        game.status = 'pending';
        game.clientId = clientId;
        game.clientRes = res;
        game.emit('start');
    }

    setTimeout(() => {
        if (game.status === 'pending') {
            res.status(400).send('Timeout error.');
        }
    }, 30000)
});

module.exports = router;
