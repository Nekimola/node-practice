var express = require('express');
var crypto = require('crypto');
var router = express.Router();

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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/games', (req, res, next) => {
  res.json(req.app.get('games'));
});


router.post('/games', (req, res, next) => {
  const gameId = req.body.gameId;
  const clientId = req.cookies.clientId || createClientId();
  let games = req.app.get('games');
  let game = {
    gameId,
    clientId
  };

  if (games.some(g => g.gameId === game.gameId)) {
    res.send(409, 'Game name is already in use.');
    return;
  }

  if (games.some(g => g.clientId === game.clientId)) {
    res.send(400, 'You can\'t create more than one game.');
    return;
  }

  games.push(game);
  req.app.set('games', games);

  broadcast(req, {
    action: 'add',
    gameId
  });

  res.cookie('clientId', clientId);
  res.json(game);
});


module.exports = router;
