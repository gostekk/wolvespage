var express = require('express');
var router = express.Router();

var User = require('../models/user');

// Admin panel
router.get('/', ensureAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', title: 'admin - Wolves page' });
})

// Admin
router.get('/admin', ensureAuthenticated, function (req, res) {
  res.render('admin', { layout: 'admin', title: 'admin - Wolves page' });
});

// Register
router.get('/register', ensureAuthenticated, function (req, res) {
  res.render('register', { layout: 'admin', title: 'Register - Wolves page' });
});

// Users
router.get('/users', ensureAuthenticated, function (req, res) {
  User.find({}, function (err, users) {
    var userMap = {};

    users.forEach(function (user) {
      userMap[user._id] = user;
    });

    //res.send(userMap);
    res.render('users', { layout: 'admin', title: 'Users - Wolves Page', userMap: userMap });
  });
});

// Delete user
router.get('/delete/:id', ensureAuthenticated, function (req, res) {
  //User.findOne({ _id: req.params.id }).remove().exec();
  User.remove({ _id: req.params.id }, function (err) {
    if (err) throw err;

    // TODO: Message after correct remove user
  });

  res.redirect(req.get('referer'));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.adminflag) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Register user
router.post('/register', function (req, res) {
  var username = req.body.username;
  var name = req.body.name;
  var surname = req.body.surname;
  var shirtnumber = req.body.shirtnumber;
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
    });
  } else {
    var newUser = new User({
      username: username,
      name: name,
      surname: surname,
      shirtnumber: shirtnumber,
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

module.exports = router;
