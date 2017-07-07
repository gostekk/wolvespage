var express = require('express');
var router = express.Router();

var User = require('../models/user');

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('index', { title: 'Wolves page' });
});

// Profile
router.get('/profile/:id', ensureAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, userProfile) {
    res.render('profile', { userProfile: userProfile, title: 'Profile - Wolves page' });
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
