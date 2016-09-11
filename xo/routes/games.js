const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const Game = require('../game');

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
            gameId: game.gameId,
            hostId: game.hostId,
            clientId: game.clientId,
            state: game.state
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

    if (games.some(g => g.gameId === gameId)) {
        res.status(409).send('Game name is already in use.');
        return;
    }

    if (games.some(g => g.hostId === hostId)) {
        res.status(400).send('You can\'t create more than one game.');
        return;
    }

    const game = new Game({ gameId, hostId });

    games.push(game);

    broadcast(req, {
        action: 'add',
        gameId,
        hostId
    });

    res.cookie('clientId', hostId);
    res.json({ gameId, hostId });
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

    game.on('error', e => {
        res.status(e.status).send(e.message);
    });

    game.on('connected', () => {
        broadcast(req, {
            action: 'gameStart',
            hostId: game.hostId,
            gameId
        });
    });

    game.start(clientId, res);

    setTimeout(() => {
        if (!res.headersSent) {
            res.status(400).send('Timeout error.');
        }
    }, 30000)
});


router.post('/:gameId/move', (req, res) => {
    const { move } = req.body;
    const { clientId } = req.headers;
    const { gameId } = req.params;
    const game = games.find(g => g.gameId === gameId);

    if (!clientId) {
        res.status(403).send('No clientId provided.');
        return;
    }

    if (!game) {
        res.status(404).send('Wrong gameId.');
        return;
    }

    game.on('error', e => {
        res.status(e.status).send(e.message);
    });

    game.move(move, clientId);

    res.json({ move });
});


router.get('/:gameId/move', (req, res) => {
    const { gameId } = req.params;
    const game = games.find(g => g.gameId === gameId);

    game.on('move', event => {
        res.json({
            move: event.move
        });
    });
});


router.get('/:gameId', (req, res) => {
    const { gameId } = req.params;
    const game = games.find(g => g.gameId === gameId);

});


module.exports = router;
