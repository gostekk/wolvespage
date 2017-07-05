var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
  console.log(req.user);
  res.render('index', { title: 'Wolves page' });
});

router.get('/profile', ensureAuthenticated, function (req, res) {
  res.render('profile', { user: req.user, title: 'Profile - Wolves page' });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
