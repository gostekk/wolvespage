var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Game = require('../models/game');
var Event = require('../models/event');

/************************************/
/**********  GET REQUEST  **********/
/************************************/

// Get Homepage
router.get('/', function (req, res) {
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

      Game.aggregate([
        { $lookup: {
          from: 'events',
          localField: 'eventID',
          foreignField: '_id',
          as: 'event',
        }, },
        { $unwind: '$event' },
        { $match: { 'event.level': '2 liga' } },
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
        ], function (err, teamStats2) {
        if (err) throw err;

        Game.aggregate([
          { $lookup: {
            from: 'events',
            localField: 'eventID',
            foreignField: '_id',
            as: 'event',
          }, },
          { $unwind: '$event' },
          { $match: { 'event.level': '2 liga' } },
          { $sort: { date: -1 }, },
          { $limit: 5 },
        ], function (err, last52) {
          if (err) throw err;

          res.render('index', { title: 'Wolves page',
                                navStart: true,
                                teamStats: teamStats[0],
                                last5: last5,
                                teamStats2: teamStats2[0],
                                last52: last52,});
        });
      });
    });
  });
});

// Statistics page
router.get('/stats', function (req, res) {
  res.render('stats', { navStats: true,
                        title: 'Statystyka zawodników - Wolves page', });
});

// Games
router.get('/games', function (req, res) {
  res.render('games', { navGames: true, title: 'Mecze - Wolves Page' });
});

// Game overview
router.get('/game/:id', function (req, res) {
  Game.findById(req.params.id).populate('eventID').exec(function (err, gameOverview) {
    res.render('game', { navGame: true,
                        title: 'Mecz - Wolves Page',
                        gameOverview: gameOverview, });
  });
});

// Events
router.get('/events', function (req, res) {
  res.render('events', { navEvents: true, title: 'Rozgrywki - Wolves Page' });
});

// Event page
router.get('/event/:id', function (req, res) {
  Event.findById(req.params.id, function (err, eventOverview) {
    res.render('event', { navEvent: true,
                        title: 'Rozgrywka - Wolves Page',
                        eventOverview: eventOverview, });
  });
});

/************************************/
/**********  POST REQUEST  **********/
/************************************/

// Statistics page POST
router.post('/stats', function (req, res) {
  Game.aggregate([
    { $unwind: '$players' },
    { $group: { _id: '$players._id',
                playerID: { $first: '$players.playerID' },
                gp: { $sum: 1 },
                goals: { $sum: '$players.goals' },
                assists: { $sum: '$players.assists' },
                points: { $sum: { $add: ['$players.goals', '$players.assists'] } },
                pim: { $sum: '$players.pim' }, }, },
    { $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'player',
    }, },
    { $unwind: '$player' },
    { $project: {
      _id: '$_id',
      username: '$player.username',
      name: '$player.name',
      surname: '$player.surname',
      shirtnumber: '$player.shirtnumber',
      position: '$player.position',
      gp: '$gp',
      goals: '$goals',
      assists: '$assists',
      points: '$points',
      pim: '$pim',
    }, },
  ], function (err, users) {
    if (err) throw err;
    res.json(users);
  });
});

// GAMES page POST
router.post('/games', function (req, res) {
  Game.find({}).populate('eventID').exec(function (err, games) {
    res.json(games);
  });
});

// GAME page POST
router.post('/game/:id', function (req, res) {
  Game.findById(req.params.id).populate('players.playerID').exec(function (err, gameOverview) {
    res.json(gameOverview.players);
  });
});

// EVENTS page POST
router.post('/events', function (req, res) {
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

// EVENT page POST
router.post('/event/:id', function (req, res) {
  Event.findById(req.params.id, function (err, eventValue) {
    Game.aggregate([
      { $unwind: '$players' },
      { $match: { eventID: eventValue._id } },
      { $group: { _id: '$players._id',
                  playerID: { $first: '$players.playerID' },
                  gp: { $sum: 1 },
                  goals: { $sum: '$players.goals' },
                  assists: { $sum: '$players.assists' },
                  points: { $sum: { $add: ['$players.goals', '$players.assists'] } },
                  pim: { $sum: '$players.pim' }, }, },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'player',
      }, },
      { $unwind: '$player' },
      { $project: {
        _id: '$_id',
        username: '$player.username',
        name: '$player.name',
        surname: '$player.surname',
        shirtnumber: '$player.shirtnumber',
        position: '$player.position',
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
