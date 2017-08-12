var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Game = require('../models/game');

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('index', { title: 'Wolves page' });
});

// Profile
router.get('/profile/:id', ensureAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, userProfile) {
    Game.aggregate([
      { $unwind: '$players' },
      { $match: { 'players._id': userProfile._id } },
      { $group: { _id: '$players._id',
                  gp: { $sum: 1 },
                  goals: { $sum: '$players.goals' },
                  assists: { $sum: '$players.assists' },
                  points: { $sum: { $add: ['$players.goals', '$players.assists'] } },
                  pim: { $sum: '$players.pim' }, }, },
    ], function (err, userStats) {
      if (err) throw err;
      res.render('profile', { userProfile: userProfile,
                              userStats: userStats[0],
                              title: 'Profile - Wolves page', });
    });
  });
});

// Player seasons
router.post('/profile/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) throw err;
    Game.aggregate([
      { $unwind: '$players' },
      { $match: { 'players._id': user._id } },
      { $group: { _id: '$event._id',
                  shortname: { $first: '$event.shortname' },
                  season: { $first: '$event.season' },
                  type: { $first: '$event.type' },
                  level: { $first: '$event.level' },
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

// Statistics page
router.get('/stats', ensureAuthenticated, function (req, res) {
  res.render('stats', { title: 'Stats - Wolves page', });
});

// Statistics page POST
router.post('/stats', ensureAuthenticated, function (req, res) {
  Game.aggregate([
    { $unwind: '$players' },
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
  ], function (err, users) {
    if (err) throw err;
    res.json(users);
  });
});

// User panel
router.get('/uc', ensureAuthenticated, function (req, res) {
  res.render('editprofile', { title: 'User Panel - Wolves page', });
});

// Edit profile
router.get('/uc/editprofile', ensureAuthenticated, function (req, res) {
  res.render('editprofile', { title: 'User Panel - Wolves page', });
});

// Edit profile Post
// TODO: info after succesful update User
router.post('/uc/editprofile', function (req, res) {
  var name = req.body.name;
  var surname = req.body.surname;
  var shirtnumber = req.body.shirtnumber;

  // Validation
  req.checkBody('name', 'Imię jest wymagane').notEmpty();
  req.checkBody('surname', 'Nazwisko jest wymagane').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    res.render('editprofile', {
      errors: errors,
      title: 'User Panel - Wolves page',
    });
  } else {
    User.findById(req.user._id, function (err, user) {
      if (err) throw err;

      user.name = name;
      user.surname = surname;
      user.shirtnumber = shirtnumber;
      user.save(function (err, updatedUser) {
        if (err) throw err;
        res.redirect(req.get('referer'));
      });
    });
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
