var express = require('express');
var router = express.Router();

var User = require('../models/user');

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
  console.log(req.user);
  res.render('index', { title: 'Wolves page' });
});

router.get('/profile/:id', ensureAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, userProfile) {
    res.render('profile', { userProfile: userProfile, title: 'Profile - Wolves page' });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

module.exports = router;
