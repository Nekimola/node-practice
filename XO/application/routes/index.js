var express = require('express');
var crypto = require('crypto');
var router = express.Router();
const WebSocket = require('ws');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/games', (req, res, next) => {
  res.json(req.app.get('games'));
});

router.post('/games', (req, res, next) => {
  const gameId = req.body.gameId;
  const wsc = new WebSocket(`ws:localhost:3000`);
  let games = req.app.get('games');
  if (games.indexOf(gameId) !== -1) {
    res.send(400, 'Game name is already in use');
    return;
  }

  games.push(gameId);
  req.app.set('games', games);
  const current_date = (new Date()).valueOf().toString();
  const clientId = crypto.createHash('sha1').update(current_date).digest('hex');
  wsc.on('open', () => {
    try {
        wsc.send(JSON.stringify({action: 'add', gameId: gameId}));
    } catch (e) {
      console.log(e);
    }
  });
  res.cookie('client_id', clientId);
  res.json({
    clientId,
    gameId
  });
});


module.exports = router;
