var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// 404
router.get('/404', function (req, res) {
  res.render('404', { layout: false });
});

// Login
router.get('/login', function (req, res) {
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
  { successRedirect: '/', fauilureRedirect: '/login' }),

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
