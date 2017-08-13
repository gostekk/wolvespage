var express = require('express');
var router = express.Router();
var moment = require('moment');

var User = require('../models/user');
var Game = require('../models/game');
var Event = require('../models/event');

// Admin panel
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', navAdmin: true, title: 'Admin - Wolves page' });
});

// Admin
router.get('/admin', ensureAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', navAdmin: true, title: 'Admin - Wolves page' });
});

//\\//\\//\\//\\  USERs //\\//\\//\\//\\

// Add user
router.get('/adduser', ensureAuthenticated, function (req, res) {
  res.render('adduser', { layout: 'admin',
                          navAdduser: true,
                          title: 'Dodaj użytkownika - Wolves page', });
});

// Users
router.get('/users', ensureAuthenticated, function (req, res) {
  if (req.query.show == 'inactive') {
    res.render('usersinactive', { layout: 'admin',
                                  navInactiveusers: true,
                                  title: 'Inactive users - Wolves Page', });
  } else {
    res.render('users', { layout: 'admin', navUsers: true, title: 'Users - Wolves Page' });
  }
});

router.post('/users', ensureAuthenticated, function (req, res) {
  if (req.query.show == 'inactive') {
    User.find({ active: false }, function (err, users) {
      res.json(users);
    });
  } else {
    User.find({}, function (err, users) {
      res.json(users);
    });
  }
});

// Edit user
router.get('/edituser/:id', ensureAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, userProfile) {
    if (err) throw err;
    res.render('edituser', { layout: 'admin',
                            userProfile: userProfile,
                            title: 'Profile - Wolves page', });
  });
});

// Delete user
router.delete('/user/:id', ensureAuthenticated, function (req, res) {
  User.remove({ _id: req.params.id }, function (err) {
    if (err) throw err;

    res.send(true);
  });
});

// Activate/Inactivate user
router.put('/users/:id', ensureAuthenticated, function (req, res) {
  User.findOne({ _id: req.params.id, },
  function (err, user) {
    user.active = !user.active;
    user.save(function (err, updatedUser) {
      if (err) throw err;
    });
  });
});

//\\//\\//\\//\\  GAMEs //\\//\\//\\//\\

// Add game
router.get('/addgame', ensureAuthenticated, function (req, res) {
  res.render('addgame', { layout: 'admin', navAddgame: true, title: 'Add Game - Wolves Page' });
});

// Games
router.post('/games', ensureAuthenticated, function (req, res) {
  Game.find({}, function (err, games) {
    res.json(games);
  });
});

router.get('/games', ensureAuthenticated, function (req, res) {
  res.render('games', { layout: 'admin', navGames: true, title: 'Games - Wolves Page' });
});

// Game overview
router.get('/game/:id', ensureAuthenticated, function (req, res) {
  Game.findById(req.params.id, function (err, gameOverview) {
    res.render('game', { layout: 'admin',
                        navGame: true,
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
// TODO: goals can be minus degree value
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
    res.send(true);
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
    res.send(true);
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
    res.send(true);
  });
});

router.delete('/game/:id', ensureAuthenticated, function (req, res) {
  Game.remove({ _id: req.params.id }, function (err) {
    if (err) throw err;

    res.send(true);
  });
});

//\\//\\//\\//\\  EVENTs //\\//\\//\\//\\

// Add event
router.get('/addevent', ensureAuthenticated, function (req, res) {
  res.render('addevent', { layout: 'admin', navAddevent: true, title: 'Add Event - Wolves Page' });
});

// Event page
router.get('/event/:id', function (req, res) {
  Event.findById(req.params.id, function (err, eventOverview) {
    res.render('event', { layout: 'admin',
                        navEvent: true,
                        title: 'Event - Wolves Page',
                        eventOverview: eventOverview, });
  });
});

router.post('/event/:id', function (req, res) {
  Event.findById(req.params.id, function (err, eventValue) {
    Game.aggregate([
      { $unwind: '$players' },
      { $match: { 'event._id': eventValue._id } },
      { $group: { _id: '$players._id',
                  username: { $first: '$players.username' },
                  name: { $first: '$players.name' },
                  surname: { $first: '$players.surname' },
                  shirtnumber: { $first: '$players.shirtnumber' },
                  position: { $first: '$players.position' },
                  gp: { $sum: 1 },
                  goals: { $sum: '$players.goals' },
                  assists: { $sum: '$players.assists' },
                  points: { $sum: { $add: ['$players.goals', '$players.assists'] } },
                  pim: { $sum: '$players.pim' }, }, },
    ], function (err, eventStats) {
      if (err) throw err;
      res.json(eventStats);
    });
  });
});

// Events
router.get('/events', ensureAuthenticated, function (req, res) {
  res.render('events', { layout: 'admin', navEvents: true, title: 'Events - Wolves Page' });
});

router.post('/events', ensureAuthenticated, function (req, res) {
  if (req.query.active == 'true') {
    Event.find({ active: true }, function (err, events) {
      res.json(events);
    });
  } else if (req.query.active == 'false') {
    Event.find({ active: false }, function (err, events) {
      res.json(events);
    });
  }
});

// Activate/Deactivate event
router.put('/events', ensureAuthenticated, function (req, res) {
  Event.findOne({ _id: req.query.id, },
  function (err, events) {
    events.active = !events.active;
    events.save(function (err, updatedEvent) {
      if (err) throw err;
      res.send(true);
    });
  });
});

// Delete user
router.delete('/event/:id', ensureAuthenticated, function (req, res) {
  Event.remove({ _id: req.params.id }, function (err) {
    if (err) throw err;

    res.send(true);
  });
});

//\\//\\//\\//\\  POSTs //\\//\\//\\//\\

// Add user
router.post('/adduser', ensureAuthenticated, function (req, res) {
  var username = req.body.username;
  var name = req.body.name;
  var surname = req.body.surname;
  var shirtnumber = req.body.shirtnumber;
  var position = req.body.position;
  var password = req.body.password;
  var password2 = req.body.password2;
  var adminflag = (req.body.adminflag == 'on' ? true : false);
  var active = false;

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
    res.render('adduser', {
      layout: 'admin',
      navAdduser: true,
      errors: errors,
      title: 'Add User - Wolves page',
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
      active: active,
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

    res.render('adduser', {
      layout: 'admin',
      navAdduser: true,
      success: 'Poprawnie dodano nowego użytkownika',
      title: 'Add User - Wolves page',
    });
  }
});

// Add game
// TODO: repair error reload page and show errors
router.post('/addgame', ensureAuthenticated, function (req, res) {
  var teamname = req.body.teamname;
  var teamlogo = req.body.teamlogo;
  var date = new Date(moment(req.body.date, 'MM-DD-YYYY').format('MM-DD-YYYY'));
  var home = (req.body.home == 'on' ? false : true);
  var event = req.body.event[0];
  var score = req.body.score;
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
      home: home,
      event: event,
      score: score,
      players: players,
    });

    Game.addGame(newGame, function (err, game) {
      if (err) throw err;
      console.log(game);
    });

    res.send({ redirect: '/ap/games' });
  }
});

// Add event
router.post('/addevent', ensureAuthenticated, function (req, res) {
  var name = req.body.name;
  var shortname = req.body.shortname;
  var season = req.body.season;
  var type = req.body.type;
  var level = req.body.level;
  var active = true;

  // Validation
  req.checkBody('name', 'Nazwa rozgrywek jest wymagana').notEmpty();
  req.checkBody('shortname', 'Krótka nazwa rozgrywek jest wymagana').notEmpty();
  req.checkBody('season', 'Lata sezonu są wymagane').notEmpty();
  req.checkBody('type', 'Typ rozgrywek jest wymagany').notEmpty();
  req.checkBody('level', 'Poziom rozgrywek jest wymagany').notEmpty();

  // TODO: Add Validationerror if name already exists in db
  Event.findOne({
    name: name,
    shortname: shortname,
    season: season,
    type: type, }, function (err, event_) {
      if (err) throw err;
      if (event_) {
        console.log('event exist');
      } else {
        console.log('event doesn\'t exist');
      }
    }
  );
  var errors = req.validationErrors();

  if (errors) {
    res.render('addevent', {
      layout: 'admin',
      navAddevent: true,
      errors: errors,
      title: 'Add Event - Wolves page',
    });
  } else {
    var newEvent = new Event({
      name: name,
      shortname: shortname,
      season: season,
      type: type,
      level: level,
      active: active,
    });

    Event.addEvent(newEvent, function (err, event) {
      if (err) throw err;
      console.log(event);
    });

    res.render('addevent', {
      layout: 'admin',
      navAddevent: true,
      success: 'Poprawnie dodano nowy rodzaj rozgrywek',
      title: 'Add Event - Wolves page',
    });
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.adminflag) {
      return next();
    } else {
      res.redirect('/404');
    }
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
