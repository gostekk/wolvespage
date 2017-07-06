var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var session = require('express-session');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var config = require('./config/database');

// Connect to database
mongoose.connect(config.database, {
  useMongoClient: true,
});

var db = mongoose.connection;

var routes = require('./routes/index');
var admins = require('./routes/admins');
var users = require('./routes/users');

// Init app
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
  secret: config.secret,
  saveUninitialized: true,
  resave: true,
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.');
    var root = namespace.shift();
    var formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value,
    };
  },
}));

// Global Vars
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/', users);
app.use('/ap', admins);

// Set Port
app.set('port', (process.env.PORT || 3004));

app.listen(app.get('port'), function () {
  console.log('Started on port ' + app.get('port'));
});
