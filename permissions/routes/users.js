var express = require('express');
var router = express.Router();
const User = require('models/User').User;

/* GET users listing. */
router.get('/', function(req, res, next) {
  const usersList = User.find({}).exec()
  .then( data => res.json(data));
});

router.post('/add', (req, res, next) => {
  const user = new User(req.body);
  user.save(function (err) {
    if (err) res.json(err);
    res.json({ message: 'OK' });
  });
});

module.exports = router;
