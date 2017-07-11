var mongoose = require('mongoose');

// Game Schema
var GameSchema = mongoose.Schema({
  teamname: {
    type: String,
    index: true,
  },
  teamlogo: {
    type: String,
  },
  date: {
    type: Date,
  },
  away: {
    type: Boolean,
  },
  place: {
    type: String,
  },
});

var Game = module.exports = mongoose.model('Game', GameSchema);

module.exports.addGame = function (newGame, callback) {
  newGame.save(callback);
};

module.exports.getGameById = function (id, callback) {
  Game.findById(id, callback);
};
