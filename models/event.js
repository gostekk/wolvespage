var mongoose = require('mongoose');

// Event Schema
var EventSchema = mongoose.Schema({
  name: {
    type: String,
    index: true,
  },
  level: {
    type: String,
  },
});

var Event = module.exports = mongoose.model('Event', EventSchema);

module.exports.addEvent = function (newEvent, callback) {
  newEvent.save(callback);
};

module.exports.getEventById = function (id, callback) {
  Event.findById(id, callback);
};
