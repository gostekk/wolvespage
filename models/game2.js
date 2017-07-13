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
  players: [
    {
      goalkeeppers: [
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
      formation1: {
        lw: {
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
          goals: {
            type: Number,
          },
          assists: {
            type: Number,
          },
          pim: {
            type: Number,
          },
        },
        rw: {
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
          goals: {
            type: Number,
          },
          assists: {
            type: Number,
          },
          pim: {
            type: Number,
          },
        },
        c: {
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
          goals: {
            type: Number,
          },
          assists: {
            type: Number,
          },
          pim: {
            type: Number,
          },
        },
        ld: {
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
          goals: {
            type: Number,
          },
          assists: {
            type: Number,
          },
          pim: {
            type: Number,
          },
        },
        rd: {
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
          goals: {
            type: Number,
          },
          assists: {
            type: Number,
          },
          pim: {
            type: Number,
          },
        },
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
