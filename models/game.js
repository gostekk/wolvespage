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
  goals: [
    {
      score: {
        type: String,
      },
      goal: {
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
      },
      assist: [
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
        },
      ],
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
