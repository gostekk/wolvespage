var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true,
  },
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  shirtnumber: {
    type: Number,
    unique: true,
  },
  position: {
    type: String,
  },
  password: {
    type: String,
  },
  adminflag: {
    type: Boolean,
  },
  active: {
    type: Boolean,
  },
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.changeUserPassword = function (userID, newPassword, callback) {
  User.findById(userID, function (err, user) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newPassword, salt, function (err, hash) {
        user.password = hash;
        user.save(callback);
      });
    });
  });
};

module.exports.getUserByUsername = function (username, callback) {
  var query = { username: username };
  User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};
