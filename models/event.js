var mongoose = require('mongoose');

// Event Schema
var EventSchema = mongoose.Schema({
  name: {
    type: String,
  },
  level: {
    type: String,
  },
  shortname: {
    type: String,
  },
  active: {
    type: Boolean,
  },
});

var Event = module.exports = mongoose.model('Event', EventSchema);

module.exports.addEvent = function (newEvent, callback) {
  newEvent.save(callback);
};

module.exports.getEventById = function (id, callback) {
  Event.findById(id, callback);
};
