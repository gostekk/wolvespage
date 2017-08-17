var mongoose = require('mongoose');

var User = require('./user');
var Event = require('./event');

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
  home: {
    type: Boolean,
  },
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  periods: {
    first: {
      opponent: {
        type: Number,
      },
      our: {
        type: Number,
      },
    },
    second: {
      opponent: {
        type: Number,
      },
      our: {
        type: Number,
      },
    },
    third: {
      opponent: {
        type: Number,
      },
      our: {
        type: Number,
      },
    },
    overtime: {
      opponent: {
        type: Number,
      },
      our: {
        type: Number,
      },
    },
    shootout: {
      opponent: {
        type: Number,
      },
      our: {
        type: Number,
      },
    },
  },
  players: [{
    playerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  status: {
    win: {
      type: Number,
    },
    draw: {
      type: Number,
    },
    lose: {
      type: Number,
    },
    overtimeWin: {
      type: Number,
    },
    overtimeLose: {
      type: Number,
    },
    shootoutWin: {
      type: Number,
    },
    shootoutLose: {
      type: Number,
    },
  },
});

var Game = module.exports = mongoose.model('Game', GameSchema);

module.exports.addGame = function (newGame, callback) {
  newGame.save(callback);
};

module.exports.getGameById = function (id, callback) {
  Game.findById(id, callback);
};
