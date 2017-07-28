var express = require('express');
var router = express.Router();
var moment = require('moment');

var User = require('../models/user');
var Game = require('../models/game');

// Admin panel
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', title: 'admin - Wolves page' });
});

// Admin
router.get('/admin', ensureAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', title: 'admin - Wolves page' });
});

// Register
router.get('/register', ensureAuthenticated, function (req, res) {
  res.render('register', { layout: 'admin', title: 'Register - Wolves page' });
});

// Users
router.post('/users', ensureAuthenticated, function (req, res) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});

router.get('/users', ensureAuthenticated, function (req, res) {
  res.render('users', { layout: 'admin', title: 'Users - Wolves Page' });
});

// Delete user
router.delete('/user/:id', ensureAuthenticated, function (req, res) {
  User.remove({ _id: req.params.id }, function (err) {
    if (err) throw err;

    // TODO: Message after correct remove user
  });
});

// Add game
router.get('/addgame', ensureAuthenticated, function (req, res) {
  res.render('addgame', { layout: 'admin', title: 'Add Game - Wolves Page' });
});

// Games
router.post('/games', ensureAuthenticated, function (req, res) {
  Game.find({}, function (err, games) {
    res.json(games);
  });
});

router.get('/games', ensureAuthenticated, function (req, res) {
  res.render('games', { layout: 'admin', title: 'Games - Wolves Page' });
});

// Game overview
router.get('/game/:id', ensureAuthenticated, function (req, res) {
  Game.findById(req.params.id, function (err, gameOverview) {
    res.render('game', { layout: 'admin',
                        title: 'Game - Wolves Page',
                        gameOverview: gameOverview, });
  });
});

router.post('/game/:id', ensureAuthenticated, function (req, res) {
  Game.findById(req.params.id, function (err, gameOverview) {
    res.json(gameOverview.players);
  });
});

// Inc/dec goals
router.put('/game/:id', ensureAuthenticated, function (req, res) {
  Game.findOneAndUpdate({ _id: req.params.id,
                  'players._id': req.body.player._id, },
  {
    $inc:
    {
      'players.$.goals': req.body.value,
    },
  }, function (err, user) {
    if (err) throw err;
  });
});

// Inc/dec assists
router.purge('/game/:id', ensureAuthenticated, function (req, res) {
  Game.findOneAndUpdate({ _id: req.params.id,
                  'players._id': req.body.player._id, },
  {
    $inc:
    {
      'players.$.assists': req.body.value,
    },
  }, function (err, user) {
    if (err) throw err;
  });
});

// Inc/dec pims
router.merge('/game/:id', ensureAuthenticated, function (req, res) {
  Game.findOneAndUpdate({ _id: req.params.id,
                  'players._id': req.body.player._id, },
  {
    $inc:
    {
      'players.$.pim': req.body.value,
    },
  }, function (err, user) {
    if (err) throw err;
  });
});

router.delete('/game/:id', ensureAuthenticated, function (req, res) {
  Game.remove({ _id: req.params.id }, function (err) {
    if (err) throw err;

    // TODO: Message after correct remove user
  });
});

// Register user
router.post('/register', ensureAuthenticated, function (req, res) {
  var username = req.body.username;
  var name = req.body.name;
  var surname = req.body.surname;
  var shirtnumber = req.body.shirtnumber;
  var position = req.body.position;
  var password = req.body.password;
  var password2 = req.body.password2;
  var adminflag = req.body.adminflag;

  // Validation
  req.checkBody('username', 'Username jest wymagany').notEmpty();
  req.checkBody('name', 'Imię jest wymagane').notEmpty();
  req.checkBody('surname', 'Nazwisko jest wymagane').notEmpty();
  req.checkBody('password', 'Hasło jest wymagane').notEmpty();
  req.checkBody('password',
  'Hasło musi zawierać co najmniej 6 znaków oraz nie wiecej niż 20').len(6, 20);
  req.checkBody('password2', 'Hasła nie pasują do siebie').equals(req.body.password);

  // TODO: Check if numerkoszulki already exist in db
  // TODO: Add Validationerror if username already exists in db
  // TODO: Add Validationerror if numerkoszulki already exists in db
  User.findOne({
    username: username, }, function (err, user) {
      if (err) throw err;
      if (user) {
        console.log('user exist');
      } else {
        console.log('user dsnt exist');
      }
    }
  );
  var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      layout: 'admin',
      errors: errors,
      title: 'Register - Wolves page',
    });
  } else {
    var newUser = new User({
      username: username,
      name: name,
      surname: surname,
      shirtnumber: shirtnumber,
      position: position,
      password: password,
      adminflag: adminflag,
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

    res.redirect(req.get('referer'));
  }
});

// Add game
router.post('/addgame', ensureAuthenticated, function (req, res) {
  var teamname = req.body.teamname;
  var teamlogo = req.body.teamlogo;
  var date = new Date(moment(req.body.date, 'MM-DD-YYYY').format('MM-DD-YYYY'));
  var players = req.body.players;

  // Validation
  req.checkBody('teamname', 'Nazwa drużyny przeciwnej jest wymagana').notEmpty();
  req.checkBody('date', 'Nazwa data').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    res.send({ redirect: 'reload' });
  } else {

    var newGame = new Game({
      teamname: teamname,
      teamlogo: teamlogo,
      date: date,
      players: players,
    });

    Game.addGame(newGame, function (err, game) {
      if (err) throw err;
      console.log(game);
    });

    res.send({ redirect: '/ap/games' });
  }
});

// TODO: if !isAuthenticated redirect to /login | if isAuthenticated refresh page and info
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.adminflag) {
    return next();
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
