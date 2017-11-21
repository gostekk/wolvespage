var express = require('express');
var router = express.Router();
var moment = require('moment');

var User = require('../models/user');
var Game = require('../models/game');
var Event = require('../models/event');

// Admin panel
router.get('/', ensureIsAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', navAdmin: true, title: 'Admin - Wolves page' });
});

// Admin
router.get('/admin', ensureIsAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', navAdmin: true, title: 'Admin - Wolves page' });
});

//\\//\\//\\//\\  USERs //\\//\\//\\//\\

// Profile
router.get('/profile/:id', ensureIsAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, userProfile) {
    Game.aggregate([
      { $unwind: '$players' },
      { $match: { 'players._id': userProfile._id } },
      { $group: { _id: '$players._id',
                  gp: { $sum: 1 },
                  goals: { $sum: '$players.goals' },
                  assists: { $sum: '$players.assists' },
                  points: { $sum: { $add: ['$players.goals', '$players.assists'] } },
                  pim: { $sum: '$players.pim' },
                  goalsAvg: { $avg: '$players.goals' },
                  assistsAvg: { $avg: '$players.assists' },
                  pointsAvg: { $avg: { $add: ['$players.goals', '$players.assists'] } }, }, },
    ], function (err, userStats) {
      if (err) throw err;
      res.render('profileap', { layout: 'admin',
                              userProfile: userProfile,
                              userStats: userStats[0],
                              navProfile: true,
                              title: userProfile.username + ' - Wolves page', });
    });
  });
});

// Player seasons
router.post('/profile/:id', ensureIsAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) throw err;
    Game.aggregate([
      { $unwind: '$players' },
      { $match: { 'players._id': user._id } },
      { $group: { _id: '$eventID',
                  gp: { $sum: 1 },
                  goals: { $sum: '$players.goals' },
                  assists: { $sum: '$players.assists' },
                  points: { $sum: { $add: ['$players.goals', '$players.assists'] } },
                  pim: { $sum: '$players.pim' }, }, },
      { $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event',
      }, },
      { $unwind: '$event' },
      { $project: {
        _id: '$_id',
        shortname: '$event.shortname',
        season: '$event.season',
        type: '$event.type',
        level: '$event.level',
        gp: '$gp',
        goals: '$goals',
        assists: '$assists',
        points: '$points',
        pim: '$pim',
      }, },

    ], function (err, eventStats) {
      if (err) throw err;
      res.json(eventStats);
    });
  });
});

// Statistics page
router.get('/stats', ensureIsAuthenticated, function (req, res) {
  res.render('stats', { layout: 'admin',
                        navStats: true,
                        title: 'Statystyka zawodników - Wolves page', });
});

// Add user
router.get('/adduser', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addUser || req.user.permissions.superAdmin) {
    res.render('adduser', { layout: 'admin',
                            navAdduser: true,
                            title: 'Dodaj użytkownika - Wolves page', });
  } else {
    res.status(401);
  }
});

// Users
router.get('/users', ensureAuthenticated, function (req, res) {
  if (req.query.show == 'inactive') {
    res.render('usersinactive', { layout: 'admin',
                                  navInactiveusers: true,
                                  title: 'Nieaktywni użytkownicy - Wolves Page', });
  } else {
    res.render('users', { layout: 'admin', navUsers: true, title: 'Użytkownicy - Wolves Page' });
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

// user overview
router.get('/user/:id', ensureAuthenticated, function (req, res) {
  if ((req.query.page == 'permissions' && req.user.permissions.editUser) ||
      (req.query.page == 'permissions' && req.user.permissions.superAdmin)) {
    User.findById(req.params.id, function (err, userProfile) {
      if (err) throw err;
      res.render('userpermissions', { layout: 'admin',
                          userProfile: userProfile,
                          title: 'Uprawnienia użytkownika - Wolves page', });
    });
  } else if (req.user.permissions.editUser || req.user.permissions.superAdmin) {
    User.findById(req.params.id, function (err, userProfile) {
      if (err) throw err;
      res.render('user', { layout: 'admin',
                          userProfile: userProfile,
                          title: 'Podgląd użytkownika - Wolves page', });
    });
  } else {
    res.status(401);
  }
});

// Delete user
router.delete('/user/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.deleteUser || req.user.permissions.superAdmin) {
    User.remove({ _id: req.params.id }, function (err) {
      if (err) throw err;

      res.send(true);
    });
  } else {
    res.status(401);
  }
});

// Activate/Deactivate user
router.put('/user/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editUser || req.user.permissions.superAdmin) {
    User.findOne({ _id: req.params.id, },
    function (err, user) {
      if (req.query.action == 'activate' && user.active == false) {
        user.active = !user.active;
      } else if (req.query.action == 'deactivate' && user.active == true) {
        user.active = !user.active;
      }

      user.save(function (err, updatedUser) {
        if (err) throw err;
        res.status(200).send(true);
      });
    });
  } else {
    res.status(401);
  }
});

//\\//\\//\\//\\  GAMEs //\\//\\//\\//\\

// Add game wizard
router.get('/addgame', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addGame || req.user.permissions.superAdmin) {
    res.render('addgame', { layout: 'admin', navAddgame: true, title: 'Dodaj mecz - Wolves Page' });
  } else {
    res.status(401);
  }
});

// Add game standard
router.get('/addgame1', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addGame || req.user.permissions.superAdmin) {
    res.render('addgame2', { layout: 'admin', navAddgame: true, title: 'Dodaj mecz - Wolves Page',
    });
  } else {
    res.status(401);
  }
});

// Games
router.get('/games', ensureIsAuthenticated, function (req, res) {
  res.render('games', { layout: 'admin', navGames: true, title: 'Mecze - Wolves Page' });
});

// Game overview
router.get('/game/:id', ensureIsAuthenticated, function (req, res) {
  Game.findById(req.params.id).populate('eventID').exec(function (err, gameOverview) {
    res.render('game', { layout: 'admin',
                        navGame: true,
                        title: 'Mecz - Wolves Page',
                        gameOverview: gameOverview, });
  });
});

// Adding user to game
// TODO: create button or something to add player
router.get('/game/adduser/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editGame || req.user.permissions.superAdmin) {
    User.findById(req.query.id, function (err, user) {
      Game.findOneAndUpdate({ _id: req.params.id },
      {
        $push:
        {
          players:
          {
            playerID: user._id,
            _id: user._id,
          },
        },
      }, function (err, user) {
        if (err) throw err;
        res.status(200).send(true);
      });
    });
  } else {
    res.status(401);
  }
});

// Inc/dec goals
// TODO: goals can be minus degree value
router.put('/game/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editGame || req.user.permissions.superAdmin) {
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
  } else {
    res.status(401);
  }
});

// Inc/dec assists
router.purge('/game/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editGame || req.user.permissions.superAdmin) {
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
  } else {
    res.status(401);
  }
});

// Inc/dec pims
router.merge('/game/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editGame || req.user.permissions.superAdmin) {
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
  } else {
    res.status(401);
  }
});

router.delete('/game/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.deleteGame || req.user.permissions.superAdmin) {
    Game.remove({ _id: req.params.id }, function (err) {
      if (err) throw err;
      res.status(200).send(true);
    });
  } else {
    res.status(401);
  }
});

//\\//\\//\\//\\  EVENTs //\\//\\//\\//\\

// Add event
router.get('/addevent', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addEvent || req.user.permissions.superAdmin) {
    res.render('addevent', { layout: 'admin',
                            navAddevent: true,
                            title: 'Dodaj rozgrywki - Wolves Page', });
  } else {
    res.status(401);
  }
});

// Event page
router.get('/event/:id', ensureIsAuthenticated, function (req, res) {
  Event.findById(req.params.id, function (err, eventOverview) {
    res.render('event', { layout: 'admin',
                        navEvent: true,
                        title: 'Rozgrywka - Wolves Page',
                        eventOverview: eventOverview, });
  });
});

// Events
router.get('/events', ensureIsAuthenticated, function (req, res) {
  res.render('events', { layout: 'admin', navEvents: true, title: 'Rozgrywki - Wolves Page' });
});

// Activate/Deactivate event
router.put('/events', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editEvent || req.user.permissions.superAdmin) {
    Event.findOne({ _id: req.query.id, },
    function (err, events) {
      events.active = !events.active;
      events.save(function (err, updatedEvent) {
        if (err) throw err;
        res.send(true);
      });
    });
  } else {
    res.status(401);
  }
});

// Delete user
router.delete('/event/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.deleteEvent || req.user.permissions.superAdmin) {
    Event.remove({ _id: req.params.id }, function (err) {
      if (err) throw err;

      res.send(true);
    });
  } else {
    res.status(401);
  }
});

//\\//\\//\\//\\  POSTs //\\//\\//\\//\\

// Add user
router.post('/adduser', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addUser || req.user.permissions.superAdmin) {
    var username = req.body.username;
    var name = req.body.name;
    var surname = req.body.surname;
    var shirtnumber = req.body.shirtnumber;
    var position = req.body.position;
    var password = req.body.password;
    var password2 = req.body.password2;
    if (req.user.permissions.superAdmin) {
      var permissions = req.body.permissions;
    } else if (req.user.permissions.editPermissions) {
      var permissions = req.body.permissions;
      permissions.deleteUser = false;
      permissions.deleteGame = false;
      permissions.deleteEvent = false;
      permissions.editPermissions = false;
      permissions.superAdmin = false;
    } else {
      var permissions = {
        adminPanel: false,
        addUser: false,
        addGame: false,
        addEvent: false,
        addLiveGame: false,
        editUser: false,
        editGame: false,
        editEvent: false,
        editLiveGame: false,
        deleteUser: false,
        deleteGame: false,
        deleteEvent: false,
        editPermissions: false,
        superAdmin: false,
      };
    }

    // TODO: if newUser is admin change active to true
    var active = false;

    // Validation
    req.checkBody('username', 'Username jest wymagany').notEmpty();
    req.checkBody('name', 'Imię jest wymagane').notEmpty();
    req.checkBody('surname', 'Nazwisko jest wymagane').notEmpty();
    req.checkBody('password', 'Hasło jest wymagane').notEmpty();
    req.checkBody('password',
    'Hasło musi zawierać co najmniej 6 znaków oraz nie wiecej niż 20').len(6, 20);
    req.checkBody('password2', 'Hasła nie pasują do siebie').equals(req.body.password);

    var errors = req.validationErrors();

    User.findOne({
      username: username, }, function (err, user) {
        if (err) throw err;
        if (user) {
          errors.push({ param: 'username',
            msg: 'Istnieje użytkownik z podanym username',
            value: '',
          });
        }
      }
    );
    User.findOne({
      shirtnumber: shirtnumber, }, function (err, user) {
        if (err) throw err;
        if (user) {
          errors.push({ param: 'shirtnumber',
            msg: 'Istnieje użytkownik z podanym numerem',
            value: '',
          });
        }
      }
    );

    if (errors) {
      res.status(409).send(errors);
    } else {
      var newUser = new User({
        username: username,
        name: name,
        surname: surname,
        shirtnumber: shirtnumber,
        position: position,
        password: password,
        active: active,
        permissions: permissions,
      });

      User.createUser(newUser, function (err, user) {
        if (err) throw err;
        res.status(200).send('Użytkownik został dodany');
      });
    }
  } else {
    res.status(401).send('Brak odpowiednich uprawnień !');
  }
});

// Edit user post
router.post('/user/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editUser || req.user.permissions.superAdmin) {
    User.findById(req.params.id, function (err, user) {
      // USERNAME
      if (user.username != req.body.username && req.body.username) {
        User.getUserByUsername(req.body.username, function (err, userValidation) {
          if (err) throw err;
          if (userValidation) {
            res.status(500).send('Podany username jest zajęty');
          } else {
            user.username = req.body.username;
            user.save(function (err, updatedUser) {
              if (err) throw err;
              res.status(200).send(true);
            });
          }
        });
      }

      // SHIRTNUMBER
      if (user.shirtnumber != req.body.shirtnumber && req.body.shirtnumber) {
        User.findOne({ shirtnumber: req.body.shirtnumber }, function (err, userValidation) {
          if (err) throw err;
          if (userValidation) {
            res.status(500).send('Podany numer jest zajęty');
          } else {
            user.shirtnumber = req.body.shirtnumber;
            user.save(function (err, updatedUser) {
              if (err) throw err;
              res.status(200).send(true);
            });
          }
        });
      }

      // NAME // SURNAME // POSITION
      if (req.body.name || req.body.surname || req.body.position) {
        user.name = req.body.name ? req.body.name : user.name;
        user.surname = req.body.surname ? req.body.surname : user.surname;
        user.position = req.body.position ? req.body.position : user.position;

        user.save(function (err, updatedUser) {
          if (err) throw err;
          res.status(200).send(true);
        });
      }

      if (req.body.password) {
        User.changeUserPassword(req.params.id, req.body.password, function (err, updatedUser) {
          if (err) throw err;
          res.status(200).send(true);
        });
      }
    });
  } else {
    res.status(401);
  }
});

// change user permissions
router.post('/editpermissions/:id', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.editPermissions || req.user.permissions.superAdmin) {
    User.findById(req.params.id, function (err, user) {
      user.permissions = req.body.permissions;
      user.save(function (err, updatedUser) {
        if (err) throw err;
        res.status(200).send(true);
      });
    });
  } else {
    res.status(401);
  }
});

// Add game
router.post('/addgame', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addGame || req.user.permissions.superAdmin) {
    var teamname = req.body.teamname;
    var teamlogo = req.body.teamlogo;
    var date = new Date(moment(req.body.date, 'MM-DD-YYYY').format('MM-DD-YYYY'));
    var home = !req.body.home;
    var eventID = req.body.event[0]._id;
    var periods = req.body.periods;
    var status = req.body.status;
    var players = req.body.players;

    // Validation
    req.checkBody('teamname', 'Nazwa drużyny przeciwnej jest wymagana').notEmpty();
    req.checkBody('date', 'Nazwa data').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
      res.status(500).send(errors.msg);
    } else {

      var newGame = new Game({
        teamname: teamname,
        teamlogo: teamlogo,
        date: date,
        home: home,
        eventID: eventID,
        periods: periods,
        status: status,
        players: players,
      });

      console.log(newGame);

      Game.addGame(newGame, function (err, game) {
        if (err) throw err;
        console.log(game);
        res.status(200).send(true);
      });
    }
  } else {
    res.status(401);
  }
});

// Add event
router.post('/addevent', ensureAuthenticated, function (req, res) {
  if (req.user.permissions.addEvent || req.user.permissions.superAdmin) {
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
      res.status(409).send(errors);
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
        res.status(200).send('Rozgrywki zostały poprawnie dodane');
      });
    }
  } else {
    res.status(401).send('Brak odpowiednich uprawnień !');
  }
});

function ensureIsAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.permissions.adminPanel) {
      return next();
    } else {
      res.redirect('/404');
    }
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
