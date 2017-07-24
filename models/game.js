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
  players: [
    {
      username: {
        type: String,
      },
      name: {
        type: String,
      },
      surname: {
        type: String,
      },
      shirtnumber: {
        type: Number,
      },
      position: {
        type: String,
      },
      goals: {
        type: Number,
        default: 0,
      },
      assists: {
        type: Number,
        default: 0,
      },
      pim: {
        type: Number,
        default: 0,
      },
    },
  ],
});

var Game = module.exports = mongoose.model('Game', GameSchema);

module.exports.addGame = function (newGame, callback) {
  newGame.save(callback);
};

module.exports.getGameById = function (id, callback) {
  Game.findById(id, callback);
};
