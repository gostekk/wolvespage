var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Game = require('../models/game');
var Event = require('../models/event');

// Get Homepage

router.get('/', function (req, res) {
  /*
  Game.aggregate([
    { $lookup: {
      from: 'events',
      localField: 'eventID',
      foreignField: '_id',
      as: 'event',
    }, },
    { $unwind: '$event' },
    { $match: { 'event.level': 'Amator' } },
    { $group:
      {
        _id: '1',
        win: { $sum: '$status.win' },
        lose: { $sum: '$status.lose' },
        draw: { $sum: '$status.draw' },
        overtimeWin: { $sum: '$status.overtimeWin' },
        overtimeLose: { $sum: '$status.overtimeLose' },
        shootoutWin: { $sum: '$status.shootoutWin' },
        shootoutLose: { $sum: '$status.shootoutLose' },
        goalsOur: { $sum: '$periods.final.our' },
        goalsOpponent: { $sum: '$periods.final.opponent' },
        goalsAvgOur: { $avg: '$periods.final.our' },
        goalsAvgOpponent: { $avg: '$periods.final.opponent' },
      }, },
    ], function (err, teamStats) {
    if (err) throw err;

    Game.aggregate([
      { $lookup: {
        from: 'events',
        localField: 'eventID',
        foreignField: '_id',
        as: 'event',
      }, },
      { $unwind: '$event' },
      { $match: { 'event.level': 'Amator' } },
      { $sort: { date: -1 }, },
      { $limit: 5 },
    ], function (err, last5) {
      if (err) throw err;

      //res.json(last5);
      res.render('index', { title: 'Wolves page',
                            layout: false,
                            teamStats: teamStats[0],
                            last5: last5, });
    });
  });
  */
  res.redirect('/ap');
});

// 404
router.get('/404', function (req, res) {
  res.render('404', { layout: false });
});

// Login
router.get('/login', function (req, res) {
  res.render('login1', { layout: false });
});

// Login
router.get('/login1', function (req, res) {
  res.render('login', { layout: false });
});

// Logout
// TODO: Message after succesful logout
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

// POST login
// TODO: Message after succesful login
router.post('/login',
  passport.authenticate('local',
  { successRedirect: '/ap', fauilureRedirect: '/login' }),

  function (req, res) {
    res.redirect('/');
  }
);

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;
      if (!user || !user.active) {
        return done(null, false, { message: 'Unknown User or Deactivated' });
      }

      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      });
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

router.get('*', function (req, res) {
  res.redirect('/404');
});

module.exports = router;
